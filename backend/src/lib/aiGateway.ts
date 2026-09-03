import crypto from "crypto";

/**
 * ============================================================================
 * GENIUS 2026 — RESILIENT MULTI-PROVIDER AI GATEWAY & RATE LIMIT COOLDOWN POOL
 * ============================================================================
 * Features:
 * 1. Response & Prompt Caching (SHA-256 Hash with TTL & Hit Counting)
 * 2. Multi-API Key Pool for Google Gemini, Groq, OpenRouter & FreeTokenFaucet
 * 3. Automatic 429/403/503 Cooldown Tracker & Seamless Round-Robin Rotation
 * 4. Async FIFO Concurrency Queue with Rate-Spacing Delay
 * 5. Universal Text & Vision (Multimodal Base64) Support
 * 6. Zero-Downtime Local Fallback Integration
 */

export interface CacheEntry {
  hash: string;
  response: any;
  createdAt: number;
  expiresAt: number;
  hits: number;
  provider: string;
  model: string;
}

export interface KeyState {
  key: string;
  provider: "GEMINI" | "GROQ" | "OPENROUTER" | "FAUCET";
  cooldownUntil: number;
  failureCount: number;
  successCount: number;
}

export interface AiRequestOptions {
  prompt: string;
  systemPrompt?: string;
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
  imageBase64?: string;
  mimeType?: string;
  preferredModel?: string;
  cacheTtlMinutes?: number;
  bypassCache?: boolean;
}

export interface AiResponseResult {
  text: string;
  parsedJson?: any;
  provider: string;
  model: string;
  cached: boolean;
  latencyMs: number;
}

class AiGatewayManager {
  // In-Memory LRU & TTL Cache
  private cache = new Map<string, CacheEntry>();
  private cacheHits = 0;
  private cacheMisses = 0;
  private defaultTtlMinutes = 180; // 3 hours

  // Key Pools
  private geminiKeys: KeyState[] = [];
  private groqKeys: KeyState[] = [];
  private openrouterKeys: KeyState[] = [];
  private faucetKeys: KeyState[] = [];

  // Round-robin indexes
  private geminiIdx = 0;
  private groqIdx = 0;
  private openrouterIdx = 0;
  private faucetIdx = 0;

  // Queue State
  private queue: Array<{
    task: () => Promise<AiResponseResult>;
    resolve: (val: AiResponseResult) => void;
    reject: (err: any) => void;
  }> = [];
  private activeWorkers = 0;
  private maxConcurrency = 2; // Process 2 requests at a time to stay under free tier RPM
  private spacingDelayMs = 250; // 250ms spacing between dispatched requests

  constructor() {
    this.reloadKeysFromEnv();
    
    // Auto cleanup expired cache every 15 minutes
    setInterval(() => this.purgeExpiredCache(), 15 * 60 * 1000);
  }

  /**
   * Parse multi-key environment variables
   */
  public reloadKeysFromEnv() {
    // 1. Gemini Keys (comma separated, numbered, or single)
    const rawGemini = [
      process.env.GEMINI_API_KEYS,
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GOOGLE_API_KEY,
    ].filter(Boolean);

    const parsedGemini = this.extractKeys(rawGemini);
    this.geminiKeys = parsedGemini.map((k) => ({
      key: k,
      provider: "GEMINI",
      cooldownUntil: 0,
      failureCount: 0,
      successCount: 0,
    }));

    // 2. Groq Keys
    const rawGroq = [
      process.env.GROQ_API_KEYS,
      process.env.GROQ_API_KEY,
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
    ].filter(Boolean);
    this.groqKeys = this.extractKeys(rawGroq).map((k) => ({
      key: k,
      provider: "GROQ",
      cooldownUntil: 0,
      failureCount: 0,
      successCount: 0,
    }));

    // 3. OpenRouter Keys
    const rawOpenRouter = [
      process.env.OPENROUTER_API_KEYS,
      process.env.OPENROUTER_API_KEY,
    ].filter(Boolean);
    this.openrouterKeys = this.extractKeys(rawOpenRouter).map((k) => ({
      key: k,
      provider: "OPENROUTER",
      cooldownUntil: 0,
      failureCount: 0,
      successCount: 0,
    }));

    // 4. FreeTokenFaucet Keys
    const rawFaucet = [
      process.env.FREETOKENFAUCET_API_KEY,
    ].filter(Boolean);
    this.faucetKeys = this.extractKeys(rawFaucet).map((k) => ({
      key: k,
      provider: "FAUCET",
      cooldownUntil: 0,
      failureCount: 0,
      successCount: 0,
    }));

    // Concurrency configuration from env
    if (process.env.AI_MAX_CONCURRENCY) {
      this.maxConcurrency = Math.max(1, parseInt(process.env.AI_MAX_CONCURRENCY, 10) || 2);
    }
    if (process.env.AI_CACHE_TTL_MINUTES) {
      this.defaultTtlMinutes = Math.max(1, parseInt(process.env.AI_CACHE_TTL_MINUTES, 10) || 180);
    }

    console.log(
      `[AI Gateway] Initialized with: ${this.geminiKeys.length} Gemini Keys, ${this.groqKeys.length} Groq Keys, ${this.faucetKeys.length} Faucet Keys | Concurrency: ${this.maxConcurrency}, Cache TTL: ${this.defaultTtlMinutes}m`
    );
  }

  private extractKeys(rawInputs: (string | undefined)[]): string[] {
    const keys: string[] = [];
    for (const item of rawInputs) {
      if (!item) continue;
      // Split by comma or semicolon
      const parts = item.split(/[,;\n]/).map((s) => s.trim()).filter((s) => s.length > 5);
      for (const p of parts) {
        if (!keys.includes(p)) {
          keys.push(p);
        }
      }
    }
    return keys;
  }

  /**
   * Generate unique SHA-256 Hash for Caching
   */
  private generateCacheHash(options: AiRequestOptions): string {
    const normalized = JSON.stringify({
      prompt: options.prompt.trim(),
      systemPrompt: (options.systemPrompt || "").trim(),
      jsonMode: !!options.jsonMode,
      // For images, hash the first 1000 + length of base64 to avoid huge string ops
      imageSig: options.imageBase64
        ? `${options.imageBase64.length}:${options.imageBase64.slice(0, 1000)}`
        : null,
    });

    return crypto.createHash("sha256").update(normalized).digest("hex");
  }

  /**
   * Main Public Gateway Execution Method with Caching and FIFO Queue
   */
  public async execute(options: AiRequestOptions): Promise<AiResponseResult> {
    const cacheKey = this.generateCacheHash(options);

    // 1. Check Cache
    if (!options.bypassCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        cached.hits++;
        this.cacheHits++;
        return {
          text: cached.response.text,
          parsedJson: cached.response.parsedJson,
          provider: `${cached.provider} (Cache Hit #\${cached.hits})`,
          model: cached.model,
          cached: true,
          latencyMs: 1,
        };
      }
    }

    this.cacheMisses++;

    // 2. Put into FIFO Concurrency Queue
    return new Promise<AiResponseResult>((resolve, reject) => {
      this.queue.push({
        task: () => this.executeThroughProviders(options, cacheKey),
        resolve,
        reject,
      });
      this.processQueue();
    });
  }

  /**
   * Process Queue with rate-spaced worker dispatch
   */
  private async processQueue() {
    if (this.activeWorkers >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    this.activeWorkers++;
    const item = this.queue.shift();

    if (item) {
      try {
        const result = await item.task();
        item.resolve(result);
      } catch (err) {
        item.reject(err);
      } finally {
        this.activeWorkers--;
        // Space out requests slightly to protect free tier RPM
        setTimeout(() => this.processQueue(), this.spacingDelayMs);
      }
    } else {
      this.activeWorkers--;
    }
  }

  /**
   * Provider Fallback Chain: Gemini -> Groq -> OpenRouter -> FreeTokenFaucet
   */
  private async executeThroughProviders(
    options: AiRequestOptions,
    cacheKey: string
  ): Promise<AiResponseResult> {
    const startTime = Date.now();

    // 1. Try Google Gemini with key rotation
    const geminiModels = [
      options.preferredModel || "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-2.0-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.6-flash",
    ];

    for (const model of geminiModels) {
      const geminiResult = await this.tryGeminiPool(model, options);
      if (geminiResult) {
        const result: AiResponseResult = {
          text: geminiResult.text,
          parsedJson: geminiResult.parsedJson,
          provider: "Google Gemini",
          model,
          cached: false,
          latencyMs: Date.now() - startTime,
        };
        this.saveToCache(cacheKey, result, options.cacheTtlMinutes);
        return result;
      }
    }

    // 2. Try Groq Cloud (Only if no image, or if text prompt)
    if (!options.imageBase64 && this.groqKeys.length > 0) {
      const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "deepseek-r1-distill-llama-70b"];
      for (const model of groqModels) {
        const groqResult = await this.tryGroqPool(model, options);
        if (groqResult) {
          const result: AiResponseResult = {
            text: groqResult.text,
            parsedJson: groqResult.parsedJson,
            provider: "Groq Cloud",
            model,
            cached: false,
            latencyMs: Date.now() - startTime,
          };
          this.saveToCache(cacheKey, result, options.cacheTtlMinutes);
          return result;
        }
      }
    }

    // 3. Try FreeTokenFaucet (Secondary backup)
    if (!options.imageBase64 && this.faucetKeys.length > 0) {
      const faucetModels = ["gpt-5.6-luna", "gpt-5.6-terra", "mimo-v2.5"];
      for (const model of faucetModels) {
        const faucetResult = await this.tryFaucetPool(model, options);
        if (faucetResult) {
          const result: AiResponseResult = {
            text: faucetResult.text,
            parsedJson: faucetResult.parsedJson,
            provider: "FreeTokenFaucet",
            model,
            cached: false,
            latencyMs: Date.now() - startTime,
          };
          this.saveToCache(cacheKey, result, options.cacheTtlMinutes);
          return result;
        }
      }
    }

    throw new Error(
      "Semua provider AI (Gemini, Groq, Faucet) sedang sibuk atau terkena limit kuota. Mengaktifkan mesin fallback lokal."
    );
  }

  /**
   * Gemini Pool Caller with Key Rotation & Cooldown
   */
  private async tryGeminiPool(
    model: string,
    options: AiRequestOptions
  ): Promise<{ text: string; parsedJson?: any } | null> {
    const availableKeys = this.getHealthyKeys(this.geminiKeys);
    if (availableKeys.length === 0) return null;

    for (let i = 0; i < availableKeys.length; i++) {
      const keyState = availableKeys[(this.geminiIdx + i) % availableKeys.length];
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyState.key}`;

        const parts: any[] = [];
        if (options.systemPrompt) {
          parts.push({ text: `[SYSTEM INSTRUCTION]\n${options.systemPrompt}\n\n` });
        }
        parts.push({ text: options.prompt });

        if (options.imageBase64) {
          const cleanBase64 = options.imageBase64.replace(/^data:image\/(webp|png|jpeg|jpg);base64,/, "");
          parts.push({
            inline_data: {
              mime_type: options.mimeType || "image/webp",
              data: cleanBase64,
            },
          });
        }

        const body: any = {
          contents: [{ parts }],
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxTokens ?? 2500,
          },
        };

        if (options.jsonMode) {
          body.generationConfig.responseMimeType = "application/json";
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(15000),
        });

        if (response.ok) {
          const json: any = await response.json();
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            keyState.successCount++;
            this.geminiIdx = (this.geminiIdx + 1) % this.geminiKeys.length;
            let parsedJson: any = null;
            if (options.jsonMode) {
              parsedJson = this.extractJson(text);
            }
            return { text, parsedJson };
          }
        }

        // Handle Rate Limit (429) or Quota Exceeded (403)
        if (response.status === 429 || response.status === 403 || response.status === 503) {
          console.warn(
            `[AI Gateway] Gemini Key (...${keyState.key.slice(-6)}) rate-limited (HTTP ${response.status}). Setting 60s cooldown.`
          );
          keyState.cooldownUntil = Date.now() + 60000;
          keyState.failureCount++;
          continue; // Try next key immediately!
        }
      } catch (err: any) {
        console.warn(`[AI Gateway] Gemini call error on key (...${keyState.key.slice(-6)}):`, err.message);
        keyState.failureCount++;
      }
    }
    return null;
  }

  /**
   * Groq Pool Caller (OpenAI-compatible)
   */
  private async tryGroqPool(
    model: string,
    options: AiRequestOptions
  ): Promise<{ text: string; parsedJson?: any } | null> {
    const availableKeys = this.getHealthyKeys(this.groqKeys);
    if (availableKeys.length === 0) return null;

    for (let i = 0; i < availableKeys.length; i++) {
      const keyState = availableKeys[(this.groqIdx + i) % availableKeys.length];
      try {
        const messages: any[] = [];
        if (options.systemPrompt) {
          messages.push({ role: "system", content: options.systemPrompt });
        }
        messages.push({ role: "user", content: options.prompt });

        const body: any = {
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2000,
        };

        if (options.jsonMode) {
          body.response_format = { type: "json_object" };
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${keyState.key}`,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(15000),
        });

        if (response.ok) {
          const json: any = await response.json();
          const text = json?.choices?.[0]?.message?.content;
          if (text) {
            keyState.successCount++;
            this.groqIdx = (this.groqIdx + 1) % this.groqKeys.length;
            let parsedJson: any = null;
            if (options.jsonMode) {
              parsedJson = this.extractJson(text);
            }
            return { text, parsedJson };
          }
        }

        if (response.status === 429 || response.status === 403) {
          keyState.cooldownUntil = Date.now() + 60000;
          keyState.failureCount++;
          continue;
        }
      } catch (err: any) {
        keyState.failureCount++;
      }
    }
    return null;
  }

  /**
   * FreeTokenFaucet Pool Caller
   */
  private async tryFaucetPool(
    model: string,
    options: AiRequestOptions
  ): Promise<{ text: string; parsedJson?: any } | null> {
    const availableKeys = this.getHealthyKeys(this.faucetKeys);
    if (availableKeys.length === 0) return null;

    for (let i = 0; i < availableKeys.length; i++) {
      const keyState = availableKeys[(this.faucetIdx + i) % availableKeys.length];
      try {
        const messages: any[] = [];
        if (options.systemPrompt) {
          messages.push({ role: "system", content: options.systemPrompt });
        }
        messages.push({ role: "user", content: options.prompt });

        const response = await fetch("https://freetokenfaucet.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${keyState.key}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 2000,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (response.ok) {
          const json: any = await response.json();
          const text = json?.choices?.[0]?.message?.content;
          if (text) {
            keyState.successCount++;
            this.faucetIdx = (this.faucetIdx + 1) % this.faucetKeys.length;
            let parsedJson: any = null;
            if (options.jsonMode) {
              parsedJson = this.extractJson(text);
            }
            return { text, parsedJson };
          }
        }

        if (response.status === 429) {
          keyState.cooldownUntil = Date.now() + 60000;
          keyState.failureCount++;
          continue;
        }
      } catch (err: any) {
        keyState.failureCount++;
      }
    }
    return null;
  }

  /**
   * Extract and parse JSON safely
   */
  public extractJson(rawText: string): any {
    try {
      if (!rawText) return null;
      let cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      cleaned = cleaned.replace(/```json/gi, "").replace(/```/g, "").trim();
      
      // Try parsing full text first
      try {
        return JSON.parse(cleaned);
      } catch {
        // Find JSON array [...] or object {...}
        const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch) return JSON.parse(arrayMatch[0]);

        const objectMatch = cleaned.match(/\{[\s\S]*\}/);
        if (objectMatch) return JSON.parse(objectMatch[0]);
      }
    } catch (err: any) {
      console.warn("[AI Gateway] JSON extract warning:", err.message);
    }
    return null;
  }

  private getHealthyKeys(keys: KeyState[]): KeyState[] {
    const now = Date.now();
    return keys.filter((k) => k.cooldownUntil <= now);
  }

  private saveToCache(hash: string, result: AiResponseResult, customTtlMinutes?: number) {
    const ttlMs = (customTtlMinutes || this.defaultTtlMinutes) * 60 * 1000;
    this.cache.set(hash, {
      hash,
      response: {
        text: result.text,
        parsedJson: result.parsedJson,
      },
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
      hits: 0,
      provider: result.provider,
      model: result.model,
    });
  }

  public purgeExpiredCache() {
    const now = Date.now();
    let deletedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(`[AI Gateway] Purged ${deletedCount} expired cache entries.`);
    }
  }

  public clearCache() {
    const size = this.cache.size;
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    return { clearedItems: size };
  }

  public getStats() {
    const now = Date.now();
    return {
      cache: {
        totalEntries: this.cache.size,
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRatio:
          this.cacheHits + this.cacheMisses > 0
            ? `${Math.round((this.cacheHits / (this.cacheHits + this.cacheMisses)) * 100)}%`
            : "0%",
        ttlMinutes: this.defaultTtlMinutes,
      },
      queue: {
        waitingLength: this.queue.length,
        activeWorkers: this.activeWorkers,
        maxConcurrency: this.maxConcurrency,
      },
      keys: {
        gemini: {
          total: this.geminiKeys.length,
          healthy: this.getHealthyKeys(this.geminiKeys).length,
          cooldown: this.geminiKeys.filter((k) => k.cooldownUntil > now).length,
        },
        groq: {
          total: this.groqKeys.length,
          healthy: this.getHealthyKeys(this.groqKeys).length,
        },
        faucet: {
          total: this.faucetKeys.length,
          healthy: this.getHealthyKeys(this.faucetKeys).length,
        },
      },
    };
  }
}

// Export singleton instance
export const aiGateway = new AiGatewayManager();
