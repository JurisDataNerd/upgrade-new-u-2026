import { ref, onMounted, onUnmounted } from "vue";

/**
 * Static In-Memory Realtime Telemetry Simulation.
 * Emulates live WebSocket events for UNU Jogja 9 Floors gamification without external server.
 */
export function useRealtime() {
  const isConnected = ref(true);
  const feedEvents = ref<any[]>([
    {
      id: "evt-1",
      event: "ADMIN_FEED_EVENT",
      type: "MISSION_COMPLETED",
      title: "Misi Diselesaikan",
      description: "Tim 01 (KH. Hasyim Asy'ari) berhasil menyelesaikan Misi L3: Cyber Codebreaker (+300 pts)",
      floorNumber: 3,
      teamName: "Kelompok 01 - KH. Hasyim Asy'ari",
      teamCode: "HASYIM-01",
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    {
      id: "evt-2",
      event: "LOCATION_STATUS_UPDATE",
      type: "QR_SCANNED",
      title: "QR Pos Terpindai",
      description: "Tim 02 (KH. Wahab Chasbullah) memindai QR di Pos Integritas Lantai 2",
      floorNumber: 2,
      teamName: "Kelompok 02 - KH. Wahab Chasbullah",
      teamCode: "WAHAB-02",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: "evt-3",
      event: "ADMIN_FEED_EVENT",
      type: "TIER_UPGRADE",
      title: "Evolusi Karakter RPG",
      description: "Mahasiswa Dewi Ayu Larasati berevolusi ke Tier 3: Arcane Master!",
      floorNumber: 5,
      teamName: "Kelompok 03 - KH. Bisri Syansuri",
      teamCode: "BISRI-03",
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
  ]);

  let intervalTimer: any = null;

  const simulatedTemplates = [
    {
      type: "MISSION_COMPLETED",
      title: "Misi Selesai",
      description: "Tim 03 (KH. Bisri Syansuri) menuntaskan Pitching di Incubator Lantai 5 (+350 pts)",
      floorNumber: 5,
      teamName: "Kelompok 03 - KH. Bisri Syansuri",
      teamCode: "BISRI-03",
    },
    {
      type: "QR_SCANNED",
      title: "QR Terverifikasi",
      description: "Buddy Fikri memverifikasi kedatangan Tim 01 di Lab Bioteknologi Lantai 4",
      floorNumber: 4,
      teamName: "Kelompok 01 - KH. Hasyim Asy'ari",
      teamCode: "HASYIM-01",
    },
    {
      type: "SCORE_AWARDED",
      title: "Kuis Kilat Berhasil",
      description: "Tim 04 (Gus Dur) meraih skor sempurna 200 pts pada Aswaja Speed Quiz Lantai 1",
      floorNumber: 1,
      teamName: "Kelompok 04 - Gus Dur",
      teamCode: "GUSDUR-04",
    },
    {
      type: "STAGE_PROGRESS",
      title: "Progres Tahapan",
      description: "Tim 02 menyelesaikan 5 dari 9 pos eksplorasi kampus UNU Jogja",
      floorNumber: 6,
      teamName: "Kelompok 02 - KH. Wahab Chasbullah",
      teamCode: "WAHAB-02",
    },
  ];

  onMounted(() => {
    // Generate periodic subtle live events
    intervalTimer = setInterval(() => {
      const template = simulatedTemplates[Math.floor(Math.random() * simulatedTemplates.length)];
      feedEvents.value.unshift({
        id: `evt-${Date.now()}`,
        event: "ADMIN_FEED_EVENT",
        ...template,
        timestamp: new Date().toISOString(),
      });
      if (feedEvents.value.length > 30) {
        feedEvents.value.pop();
      }
    }, 18000);
  });

  onUnmounted(() => {
    if (intervalTimer) clearInterval(intervalTimer);
  });

  return {
    isConnected,
    feedEvents,
  };
}
