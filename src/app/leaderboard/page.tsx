'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trophy,
  UsersThree,
  User,
  SealCheck,
  MagnifyingGlass,
  ArrowRight,
  CaretDown,
  CaretUp,
} from '@phosphor-icons/react';
import { Navbar } from '@/components/layout/Navbar';
import { CrtScanlines } from '@/components/layout/CrtScanlines';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { useGameStore } from '@/store/useGameStore';
import {
  INITIAL_LEADERBOARD_USERS,
  INITIAL_LEADERBOARD_GROUPS,
  AVATAR_OPTIONS,
} from '@/data/mockData';
import { soundEngine } from '@/lib/sound';
import { LeaderboardUser, LeaderboardGroup } from '@/types/game';

export default function LeaderboardPage() {
  const participant = useGameStore((state) => state.participant);
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  const [activeTab, setActiveTab] = useState<'individu' | 'kelompok'>('individu');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>('group-03');

  // Compute live individual leaderboard including current user
  const individualList: LeaderboardUser[] = useMemo(() => {
    const currentUserEntry: LeaderboardUser = {
      id: 'current-user',
      rank: 0,
      name: `${participant.name} (Kamu)`,
      nim: participant.nim,
      faculty: participant.faculty,
      prodi: participant.prodi,
      avatar: participant.avatar,
      totalXp: participant.totalXp,
      stampsCount: participant.completedBooths.length,
      completedFloors: Math.floor(participant.completedBooths.length / 2),
      isCurrentUser: true,
      groupId: participant.groupId || 'group-03',
      groupName: 'Genius 03',
    };

    const others = INITIAL_LEADERBOARD_USERS.filter((u) => u.nim !== participant.nim);
    const combined = [...others, currentUserEntry];
    combined.sort((a, b) => b.totalXp - a.totalXp);

    return combined.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [participant]);

  // Compute live group leaderboard
  const groupList: LeaderboardGroup[] = useMemo(() => {
    const groups = INITIAL_LEADERBOARD_GROUPS.map((group) => {
      const updatedMembers = group.members.map((member) => {
        if (member.isCurrentUser || member.nim === participant.nim) {
          return {
            ...member,
            name: `${participant.name} (Kamu)`,
            nim: participant.nim,
            totalXp: participant.totalXp,
            stampsCount: participant.completedBooths.length,
            avatar: participant.avatar,
            isCurrentUser: true,
          };
        }
        return member;
      });

      const totalXp = updatedMembers.reduce((acc, m) => acc + m.totalXp, 0);
      const avgXp = Math.round(totalXp / updatedMembers.length);
      const totalStamps = updatedMembers.reduce((acc, m) => acc + m.stampsCount, 0);
      const totalStampsAvg = Number((totalStamps / updatedMembers.length).toFixed(1));

      return {
        ...group,
        members: updatedMembers,
        totalXp,
        avgXp,
        totalStampsAvg,
      };
    });

    groups.sort((a, b) => b.avgXp - a.avgXp);
    return groups.map((g, index) => ({
      ...g,
      rank: index + 1,
    }));
  }, [participant]);

  const filteredIndividuals = individualList.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.prodi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.faculty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentUserRankInfo = individualList.find((u) => u.isCurrentUser);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-md bg-[#f0d060] text-[#1b120a] flex items-center justify-center font-pixel text-xs font-black shrink-0">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-md bg-[#d4d4d8] text-[#18181b] flex items-center justify-center font-pixel text-xs font-black shrink-0">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-md bg-[#d97706] text-white flex items-center justify-center font-pixel text-xs font-black shrink-0">
          3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-md bg-[#170f07] text-[#a08060] border border-[#5a3a18] flex items-center justify-center font-pixel text-xs font-bold shrink-0">
        {rank}
      </span>
    );
  };

  const getAvatarImage = (avatarId: string) => {
    const opt = AVATAR_OPTIONS.find((a) => a.id === avatarId);
    return opt ? opt.avatarImage : '/character-cowok-avatar.png';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#2d1b0e] text-[#f0e0c0] w-full overflow-x-hidden">
      <CrtScanlines />
      <Navbar />

      <main className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 space-y-4 overflow-x-hidden">
        {/* Simple Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-pixel text-lg sm:text-2xl font-bold text-[#f0d060] flex items-center gap-2">
              <Trophy size={24} weight="fill" className="text-[#f0d060] shrink-0" />
              <span>Papan Peringkat</span>
            </h1>
            <p className="font-sans text-xs text-[#c4956a] mt-0.5">
              Peringkat perolehan poin orientasi kampus.
            </p>
          </div>

          <Link href="/play" className="shrink-0">
            <button
              onClick={() => soundEnabled && soundEngine.playClick()}
              className="rpg-btn-primary py-2 px-3 text-xs font-pixel font-bold flex items-center gap-1.5"
            >
              <span>Main</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </Link>
        </div>

        {/* Current User Highlight Card */}
        {currentUserRankInfo && (
          <div className="sdv-card-gold p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#170f07] border-2 border-[#f0d060] shrink-0 relative">
                <Image
                  src={getAvatarImage(participant.avatar)}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-pixel text-[9px] text-[#7ec850] uppercase">
                    Posisi Kamu:
                  </span>
                  <PixelBadge variant="gold" size="sm">
                    #{currentUserRankInfo.rank}
                  </PixelBadge>
                </div>
                <h3 className="font-pixel text-xs sm:text-sm font-bold text-white leading-snug break-words">
                  {participant.name}
                </h3>
                <p className="font-sans text-[11px] text-[#c4956a] leading-tight break-words">
                  {participant.nim} • {participant.prodi}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 sm:border-l border-[#5a3a18] pt-2 sm:pt-0 sm:pl-4">
              <div className="text-center">
                <div className="font-pixel text-xs text-[#f0d060] font-bold">
                  {participant.totalXp} XP
                </div>
                <div className="text-[9px] font-sans text-[#a08060]">Poin</div>
              </div>
              <div className="w-[1px] h-6 bg-[#5a3a18]" />
              <div className="text-center">
                <div className="font-pixel text-xs text-[#7ec850] font-bold">
                  {participant.completedBooths.length}/18
                </div>
                <div className="text-[9px] font-sans text-[#a08060]">Stempel</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Selector (Strict Grid 2-cols, No horizontal scroll) */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            type="button"
            onClick={() => {
              setActiveTab('individu');
              if (soundEnabled) soundEngine.playSelect();
            }}
            className={`w-full py-2.5 px-3 rounded-lg font-pixel text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'individu'
                ? 'bg-[#3d7828] text-[#f0d060] border-[#f0d060] shadow'
                : 'bg-[#170f07] text-[#a08060] border-[#5a3a18] hover:border-[#8b6f4e]'
            }`}
          >
            <User size={16} weight="bold" />
            <span>Individu</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('kelompok');
              if (soundEnabled) soundEngine.playSelect();
            }}
            className={`w-full py-2.5 px-3 rounded-lg font-pixel text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'kelompok'
                ? 'bg-[#3d7828] text-[#f0d060] border-[#f0d060] shadow'
                : 'bg-[#170f07] text-[#a08060] border-[#5a3a18] hover:border-[#8b6f4e]'
            }`}
          >
            <UsersThree size={16} weight="bold" />
            <span>Kelompok</span>
          </button>
        </div>

        {/* TAB 1: INDIVIDU */}
        {activeTab === 'individu' && (
          <div className="space-y-3 w-full">
            {/* Search Bar */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NIM, prodi..."
                className="w-full bg-[#170f07] border border-[#5a3a18] focus:border-[#f0d060] rounded-lg px-3 py-2 pl-9 text-xs text-white font-sans outline-none"
              />
              <MagnifyingGlass
                size={16}
                weight="bold"
                className="absolute left-3 top-2.5 text-[#8b6f4e]"
              />
            </div>

            {/* List Cards */}
            <div className="space-y-2 w-full">
              {filteredIndividuals.map((user) => {
                const isMe = user.isCurrentUser;

                return (
                  <div
                    key={user.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all w-full ${
                      isMe
                        ? 'bg-[#1f3a2b] border-[#f0d060] shadow'
                        : 'bg-[#170f07] border-[#3d2b1e] hover:border-[#5a3a18]'
                    }`}
                  >
                    {/* Left: Rank & Avatar & Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getRankBadge(user.rank)}

                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#281c12] border border-[#8b6f4e] shrink-0 relative">
                        <Image
                          src={getAvatarImage(user.avatar)}
                          alt={user.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4
                            className={`font-pixel text-[10px] sm:text-xs font-bold leading-normal break-words ${
                              isMe ? 'text-white' : 'text-[#f0e0c0]'
                            }`}
                          >
                            {user.name}
                          </h4>
                          {isMe && (
                            <PixelBadge variant="gold" size="sm">
                              KAMU
                            </PixelBadge>
                          )}
                        </div>
                        <p className="font-sans text-[10px] text-[#a08060] leading-tight break-words">
                          {user.prodi}
                        </p>
                      </div>
                    </div>

                    {/* Right: Points & Stamp count */}
                    <div className="text-right shrink-0">
                      <div className="font-pixel text-xs text-[#f0d060] font-bold">
                        {user.totalXp} XP
                      </div>
                      <div className="font-sans text-[10px] text-[#7ec850]">
                        {user.stampsCount}/18 Stempel
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredIndividuals.length === 0 && (
                <div className="p-6 text-center bg-[#170f07] border border-[#5a3a18] rounded-xl font-sans text-xs text-[#a08060]">
                  Tidak ada peserta yang cocok.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: KELOMPOK */}
        {activeTab === 'kelompok' && (
          <div className="space-y-2.5 w-full">
            {groupList.map((group) => {
              const isExpanded = expandedGroupId === group.id;
              const hasMe = group.members.some((m) => m.isCurrentUser);

              return (
                <div
                  key={group.id}
                  className={`sdv-card transition-all overflow-hidden w-full ${
                    hasMe ? 'border-[#f0d060]' : ''
                  }`}
                >
                  {/* Accordion Header */}
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedGroupId(isExpanded ? null : group.id);
                      if (soundEnabled) soundEngine.playSelect();
                    }}
                    className="w-full p-3 sm:p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {getRankBadge(group.rank)}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-pixel text-[10px] sm:text-xs font-bold text-white leading-normal break-words">
                            {group.name}
                          </h3>
                          {hasMe && (
                            <PixelBadge variant="gold" size="sm">
                              KAMU
                            </PixelBadge>
                          )}
                        </div>
                        <p className="font-sans text-[11px] text-[#a08060]">
                          {group.members.length} Anggota
                        </p>
                      </div>
                    </div>

                    {/* Right Stats & Expand Icon */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-pixel text-xs font-bold text-[#f0d060]">
                          {group.avgXp} XP
                        </div>
                        <div className="font-sans text-[9px] text-[#7ec850]">
                          Rata-rata
                        </div>
                      </div>

                      <div className="p-1 bg-[#170f07] border border-[#5a3a18] rounded text-[#f0d060]">
                        {isExpanded ? (
                          <CaretUp size={14} weight="bold" />
                        ) : (
                          <CaretDown size={14} weight="bold" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Accordion Content (Members Breakdown) */}
                  {isExpanded && (
                    <div className="bg-[#170f07] border-t border-[#5a3a18] p-3 space-y-2 animate-in fade-in">
                      <div className="text-[9px] font-pixel text-[#a08060] uppercase border-b border-[#3d2b1e] pb-1">
                        Anggota Kelompok:
                      </div>

                      <div className="space-y-1.5">
                        {group.members.map((member) => (
                          <div
                            key={member.id}
                            className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                              member.isCurrentUser
                                ? 'bg-[#1f3a2b] border-[#7ec850] text-[#f0ffd0]'
                                : 'bg-[#23160c] border-[#3d2b1e] text-[#e0d0b0]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-md overflow-hidden bg-[#170f07] border border-[#8b6f4e] shrink-0 relative">
                                <Image
                                  src={getAvatarImage(member.avatar)}
                                  alt={member.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-pixel text-[9px] sm:text-[10px] font-bold leading-normal break-words">
                                  {member.name}
                                </div>
                                <div className="font-sans text-[9px] text-[#a08060] leading-tight break-words">
                                  {member.prodi}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="font-pixel text-[10px] text-[#f0d060] font-bold">
                                {member.totalXp} XP
                              </div>
                              <div className="font-sans text-[9px] text-[#7ec850]">
                                {member.stampsCount} Stempel
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
