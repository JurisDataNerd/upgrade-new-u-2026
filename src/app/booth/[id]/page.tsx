'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  BookOpen,
  Question,
  CaretRight,
  Check,
} from '@phosphor-icons/react';
import { BOOTHS_DATA, FLOORS_DATA, AVATAR_OPTIONS } from '@/data/mockData';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { CelebrationModal } from '@/components/ui/CelebrationModal';
import { Navbar } from '@/components/layout/Navbar';
import { CrtScanlines } from '@/components/layout/CrtScanlines';
import { soundEngine } from '@/lib/sound';
import { PlayerLevel, StampRecord } from '@/types/game';

export default function BoothDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boothId = (params.id as string) || '';

  const booth = BOOTHS_DATA[boothId];
  const participant = useGameStore((state) => state.participant);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const completeBooth = useGameStore((state) => state.completeBooth);
  const isAlreadyCompleted = useGameStore((state) => state.isBoothCompleted(boothId));

  const selectedAvatarObj =
    AVATAR_OPTIONS.find((a) => a.id === participant.avatar) || AVATAR_OPTIONS[0];

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationDetails, setCelebrationDetails] = useState<{
    stampRecord: StampRecord | null;
    isFloorCompleted: boolean;
    floorNumber: number;
    isLevelUp: boolean;
    newLevel: PlayerLevel;
  }>({
    stampRecord: null,
    isFloorCompleted: false,
    floorNumber: booth ? booth.floorNumber : 1,
    isLevelUp: false,
    newLevel: 'New You',
  });

  if (!booth) {
    return (
      <div className="min-h-screen flex flex-col bg-[#2d1b0e] text-[#f0e0c0]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="p-8 max-w-md sdv-card-gold text-center space-y-4">
            <h2 className="font-pixel text-base font-bold text-[#ff8080]">
              BOOTH TIDAK DITEMUKAN
            </h2>
            <p className="font-sans text-sm text-[#d0c0a0]">
              Maaf, ID booth &quot;{boothId}&quot; tidak terdaftar dalam gedung 9 lantai ini.
            </p>
            <Link href="/peta">
              <button className="rpg-btn-primary py-3 px-6 text-xs font-pixel font-bold">
                Kembali ke Peta Gedung
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const floor = FLOORS_DATA.find((f) => f.number === booth.floorNumber) || FLOORS_DATA[0];

  const allBoothIds = Object.keys(BOOTHS_DATA);
  const currentIndex = allBoothIds.indexOf(boothId);
  const nextBoothId = currentIndex >= 0 && currentIndex < allBoothIds.length - 1 ? allBoothIds[currentIndex + 1] : null;
  const nextBooth = nextBoothId ? BOOTHS_DATA[nextBoothId] : null;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    if (soundEnabled) soundEngine.playSelect();
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    booth.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });
    return correctCount;
  };

  const handleSubmitQuiz = () => {
    const unanswered = booth.questions.some((q) => selectedAnswers[q.id] === undefined);
    if (unanswered) {
      if (soundEnabled) soundEngine.playWrong();
      alert('Harap pilih jawaban untuk semua soal kuis sebelum submit!');
      return;
    }

    const correctScore = calculateScore();
    setIsSubmitted(true);

    if (correctScore >= Math.ceil(booth.questions.length / 2)) {
      if (soundEnabled) soundEngine.playCorrect();

      const result = completeBooth(booth.id, correctScore, booth.questions.length);

      const stampRecord: StampRecord = {
        boothId: booth.id,
        boothName: booth.name,
        floorNumber: booth.floorNumber,
        stampTitle: booth.stampTitle,
        stampIcon: booth.stampIcon,
        stampColor: booth.stampColor,
        earnedAt: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        score: correctScore,
        totalQuestions: booth.questions.length,
      };

      setCelebrationDetails({
        stampRecord,
        isFloorCompleted: result.isFloorCompleted,
        floorNumber: booth.floorNumber,
        isLevelUp: result.isLevelUp,
        newLevel: result.newLevel,
      });

      setShowCelebration(true);
    } else {
      if (soundEnabled) soundEngine.playWrong();
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    if (soundEnabled) soundEngine.playClick();
  };

  const isAllAnswered = booth.questions.every((q) => selectedAnswers[q.id] !== undefined);
  const correctCount = isSubmitted ? calculateScore() : 0;
  const isPassed = isSubmitted && correctCount >= Math.ceil(booth.questions.length / 2);

  return (
    <div className="min-h-screen flex flex-col bg-[#2d1b0e] text-[#f0e0c0]">
      <CrtScanlines />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/peta"
            onClick={() => soundEnabled && soundEngine.playClick()}
            className="inline-flex items-center gap-2 text-xs font-pixel text-[#c4956a] hover:text-[#f0d060] transition-colors"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>KEMBALI KE PETA GEDUNG</span>
          </Link>

          <div className="flex items-center gap-2">
            <PixelBadge variant="wood" size="sm">
              Lantai {booth.floorNumber}
            </PixelBadge>
            <PixelBadge variant="gold" size="sm">
              {booth.code}
            </PixelBadge>
          </div>
        </div>

        {/* Booth Header Card (Seeds of Hope Dialogue Header) */}
        <div className="sdv-card-gold p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#5a3a18] pb-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 bg-[#170f07] border-2 border-[#f0d060] rounded-xl flex items-center justify-center text-3xl shadow-inner shrink-0">
                {booth.stampIcon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[9px] text-[#7ec850] uppercase">
                    {floor.name}
                  </span>
                  <PixelBadge variant="gold" size="sm">
                    {booth.badgeTag}
                  </PixelBadge>
                </div>
                <h1 className="font-pixel text-sm sm:text-base font-bold text-white mt-1">
                  {booth.name}
                </h1>
              </div>
            </div>

            {/* Status Stamp Marker */}
            {isAlreadyCompleted && (
              <div className="flex items-center gap-2 bg-[#14230f] border border-[#7ec850] rounded-full px-3 py-1 shadow-sm">
                <CheckCircle size={16} weight="fill" className="text-[#7ec850]" />
                <span className="font-pixel text-[9px] text-[#7ec850] font-bold">
                  SUDAH DISTEMPEL
                </span>
              </div>
            )}
          </div>

          {/* Educational Narrative Story Box (Seeds of Hope dialogue-box) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-pixel text-xs text-[#f0d060]">
              <BookOpen size={16} weight="fill" />
              <span>PENGANTAR MATERI ORIENTASI</span>
            </div>

            <div className="bg-[#170f07] p-4 sm:p-5 border-2 border-[#5a3a18] rounded-xl relative shadow-inner">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#281c12] border-2 border-[#f0d060] shrink-0 relative shadow-md">
                  <Image
                    src={selectedAvatarObj.avatarImage}
                    alt={selectedAvatarObj.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="font-pixel text-[9px] text-[#7ec850] flex items-center gap-1.5">
                    <span>{participant.name}</span>
                    <span className="text-[#a08060]">({selectedAvatarObj.gender === 'pria' ? 'Cowok' : 'Cewek'})</span>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-[#f0e6d2] leading-relaxed">
                    {booth.story}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Quiz Section */}
        <div className="sdv-card p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#5a3a18] pb-3 mb-2">
            <div className="flex items-center gap-2 font-pixel text-xs sm:text-sm font-bold text-[#f0d060]">
              <Question size={18} weight="fill" className="text-[#f0d060]" />
              <span>TANTANGAN KUIS ({booth.questions.length} SOAL)</span>
            </div>
            <span className="font-sans text-xs text-[#c4956a]">
              Jawab benar untuk mendapatkan stempel resmi
            </span>
          </div>

          {/* Question List */}
          <div className="space-y-5">
            {booth.questions.map((question, qIdx) => {
              const selectedOpt = selectedAnswers[question.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = isAnswered && selectedOpt === question.correctAnswerIndex;

              return (
                <div
                  key={question.id}
                  className="bg-[#281c12] p-4 sm:p-5 border border-[#5a3a18] rounded-xl space-y-3.5 shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-pixel text-[10px] bg-[#170f07] text-[#f0d060] px-2 py-1 rounded border border-[#5a3a18] shrink-0">
                      Soal #{qIdx + 1}
                    </span>
                    <h2 className="font-sans text-xs sm:text-sm font-semibold text-white leading-relaxed">
                      {question.text}
                    </h2>
                  </div>

                  {/* Options (Seeds of Hope dialogue-choices) */}
                  <div className="space-y-2 pt-1">
                    {question.options.map((option, optIdx) => {
                      const isOptionSelected = selectedOpt === optIdx;
                      let optionClass =
                        'dialogue-choice-item border-[#5a3a18] hover:border-[#8b6f4e]';

                      if (isSubmitted) {
                        if (optIdx === question.correctAnswerIndex) {
                          optionClass =
                            'bg-[#1f3a2b] border-[#7ec850] text-[#e0f0d0] shadow-md font-medium';
                        } else if (isOptionSelected && !isCorrect) {
                          optionClass =
                            'bg-[#3a1814] border-[#d44040] text-[#ffd0d0] shadow-md';
                        }
                      } else if (isOptionSelected) {
                        optionClass =
                          'bg-[#235736] border-[#f0d060] text-white shadow-md font-medium';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(question.id, optIdx)}
                          disabled={isSubmitted}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-start gap-3 cursor-pointer ${optionClass}`}
                        >
                          <span className="font-pixel text-[10px] w-5 h-5 flex items-center justify-center rounded bg-[#170f07] text-[#f0d060] border border-[#5a3a18] shrink-0 mt-0.5 font-bold">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="font-sans text-xs leading-relaxed flex-1">
                            {option}
                          </span>
                          {isSubmitted && optIdx === question.correctAnswerIndex && (
                            <CheckCircle size={18} weight="fill" className="text-[#7ec850] shrink-0" />
                          )}
                          {isSubmitted && isOptionSelected && !isCorrect && (
                            <XCircle size={18} weight="fill" className="text-[#ff8080] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation after submit */}
                  {isSubmitted && (
                    <div
                      className={`p-3 rounded-lg border text-xs font-sans mt-3 ${
                        isCorrect
                          ? 'bg-[#14230f] border-[#7ec850] text-[#e0f0d0]'
                          : 'bg-[#2d1210] border-[#d44040] text-[#ffd0d0]'
                      }`}
                    >
                      <div className="font-pixel text-[9px] uppercase font-bold mb-1 flex items-center gap-1.5">
                        {isCorrect ? (
                          <>
                            <CheckCircle size={14} weight="fill" className="text-[#7ec850]" />
                            <span className="text-[#7ec850]">Jawaban Tepat!</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} weight="fill" className="text-[#ff8080]" />
                            <span className="text-[#ff8080]">Pembahasan:</span>
                          </>
                        )}
                      </div>
                      <p className="leading-relaxed">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quiz Action Buttons */}
          <div className="border-t border-[#5a3a18] pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {isSubmitted ? (
                <div className="flex items-center gap-3">
                  <PixelBadge variant={isPassed ? 'emerald' : 'red'} size="md">
                    Skor: {correctCount}/{booth.questions.length} (
                    {isPassed ? 'LULUS' : 'COBA LAGI'})
                  </PixelBadge>
                  {isPassed && (
                    <span className="text-xs font-pixel text-[#7ec850]">
                      +250 XP Ditambahkan
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs font-sans text-[#a08060]">
                  {Object.keys(selectedAnswers).length}/{booth.questions.length} soal terjawab
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isSubmitted ? (
                <>
                  <button
                    onClick={handleResetQuiz}
                    className="rpg-btn-wood py-3 px-5 text-xs font-pixel font-bold w-full sm:w-auto"
                  >
                    Ulangi Kuis
                  </button>

                  {nextBooth && (
                    <Link href={`/booth/${nextBooth.id}`} className="w-full sm:w-auto">
                      <button
                        onClick={() => soundEnabled && soundEngine.playClick()}
                        className="rpg-btn-primary py-3 px-5 text-xs font-pixel font-bold w-full flex items-center justify-center gap-2"
                      >
                        <span>Booth Selanjutnya</span>
                        <CaretRight size={16} weight="bold" />
                      </button>
                    </Link>
                  )}
                </>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!isAllAnswered}
                  className="rpg-btn-primary py-3.5 px-6 text-xs font-pixel font-bold w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Check size={16} weight="bold" />
                  <span>Kirim Jawaban</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Stamp Award Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        stampRecord={celebrationDetails.stampRecord}
        isFloorCompleted={celebrationDetails.isFloorCompleted}
        floorNumber={celebrationDetails.floorNumber}
        isLevelUp={celebrationDetails.isLevelUp}
        newLevel={celebrationDetails.newLevel}
        onNextAction={() => {
          setShowCelebration(false);
          if (nextBooth) {
            router.push(`/booth/${nextBooth.id}`);
          } else {
            router.push('/paspor');
          }
        }}
        nextActionLabel={nextBooth ? 'Ke Booth Berikutnya' : 'Buka Paspor Digital'}
      />
    </div>
  );
}
