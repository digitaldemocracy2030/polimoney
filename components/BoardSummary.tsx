'use client';
import {
  Avatar,
  Badge,
  Box,
  HStack,
  NativeSelect,
  SimpleGrid,
  Stack,
  Stat,
  Text,
} from '@chakra-ui/react';
import html2canvas from 'html2canvas';
import { LandmarkIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { BoardChart } from '@/components/BoardChart';
import { BoardContainer } from '@/components/BoardContainer';
import type { Flow, Profile, Report } from '@/models/type';
import { BoardChartFixed } from './BoardChartFixed';

type Props = {
  profile: Profile;
  report: Report;
  otherReports: Report[];
  flows: Flow[];
  useFixedBoardChart?: boolean;
};

export function BoardSummary({
  profile,
  report,
  otherReports,
  flows,
  useFixedBoardChart = false,
}: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  // 現在のパスから現在のレポートIDを取得
  const currentReportId = pathname.startsWith('/')
    ? pathname.slice(1)
    : pathname;

  // 全てのレポート（現在のレポートと他のレポート）を結合（重複除去）し、年で降順ソート
  const allReports = [
    report,
    ...otherReports.filter((r) => r.id !== report.id),
  ].sort((a, b) => b.year - a.year);
  const handleCopyImage = async () => {
    const button = document.getElementById('copy-image-btn');
    if (button) button.style.display = 'none'; // ボタンを非表示
    const element = document.getElementById('summary');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 3 });
    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new window.ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } catch (_e) {
          alert('コピーに失敗しました');
        }
      }
      if (button) button.style.display = ''; // ボタンを再表示
    });
  };
  return (
    <BoardContainer id={'summary'}>
      {/* プロフィール */}
      <Box mb={10}>
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          alignItems={'center'}
          justify={'space-between'}
          gap={5}
        >
          <HStack gap={5} minW={'250px'}>
            <Avatar.Root w={'80px'} h={'80px'}>
              <Avatar.Fallback name={profile.name} />
              <Avatar.Image src={profile.image} />
            </Avatar.Root>
            <Stack gap={0}>
              <Text fontSize={'xs'}>{profile.title}</Text>
              <Text fontSize={'2xl'} fontWeight={'bold'}>
                {profile.name}
              </Text>
              <HStack mt={1}>
                <Badge variant={'outline'} colorPalette={'red'}>
                  {profile.party}
                </Badge>
                {profile.district && (
                  <Badge variant={'outline'}>{profile.district}</Badge>
                )}
              </HStack>
            </Stack>
          </HStack>
          <NativeSelect.Root w={'300px'}>
            <NativeSelect.Field
              value={currentReportId}
              onChange={(e) => {
                const target = e.target as HTMLSelectElement;
                router.push(`/${target.value}`);
              }}
            >
              {allReports.map((reportItem) => (
                <option key={reportItem.id} value={reportItem.id}>
                  {reportItem.year}年 {reportItem.orgName}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Stack>
      </Box>
      {/* タイトル */}
      <Box mb={5}>
        <HStack justify={'space-between'} alignItems={'center'}>
          <HStack fontSize={'xl'} fontWeight={'bold'}>
            <LandmarkIcon size={28} className={'income'} />
            <Text>収支の流れ</Text>
          </HStack>
        </HStack>
      </Box>
      {/* サマリー */}
      <Box mb={5}>
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={5}>
          <Box
            border={'1px solid #dddddd'}
            borderRadius={'lg'}
            p={5}
            minW={'200px'}
          >
            <Stat.Root>
              <Stat.Label
                className={'income'}
                fontWeight={'bold'}
                fontSize={'sm'}
              >
                収入総額
              </Stat.Label>
              <Stat.ValueText alignItems="baseline" fontSize={'2xl'}>
                {Math.round(report.totalIncome / 10000)}
                <Stat.ValueUnit>万円</Stat.ValueUnit>
              </Stat.ValueText>
            </Stat.Root>
          </Box>
          <Box
            border={'1px solid #dddddd'}
            borderRadius={'lg'}
            p={5}
            minW={'200px'}
          >
            <Stat.Root>
              <Stat.Label
                className={'expense'}
                fontWeight={'bold'}
                fontSize={'sm'}
              >
                支出総額
              </Stat.Label>
              <Stat.ValueText alignItems="baseline" fontSize={'2xl'}>
                {Math.round(report.totalExpense / 10000)}
                <Stat.ValueUnit>万円</Stat.ValueUnit>
              </Stat.ValueText>
            </Stat.Root>
          </Box>
          <Box
            border={'1px solid #dddddd'}
            borderRadius={'lg'}
            p={5}
            minW={'200px'}
          >
            <Stat.Root>
              <Stat.Label fontWeight={'bold'} fontSize={'sm'}>
                年間収支
              </Stat.Label>
              <Stat.ValueText alignItems="baseline" fontSize={'2xl'}>
                {Math.round(report.totalBalance / 10000)}
                <Stat.ValueUnit>万円</Stat.ValueUnit>
              </Stat.ValueText>
            </Stat.Root>
          </Box>
        </SimpleGrid>
      </Box>
      {/* タブ */}
      {/*<Box mb={5}>*/}
      {/*  <Tabs.Root*/}
      {/*    value={selectedTab}*/}
      {/*    onValueChange={(e) => setSelectedTab(e.value)}*/}
      {/*  >*/}
      {/*    <Tabs.List>*/}
      {/*      <Tabs.Trigger*/}
      {/*        value="amount"*/}
      {/*        fontWeight={'bold'}*/}
      {/*        className={selectedTab === 'amount' ? 'income' : ''}*/}
      {/*      >*/}
      {/*        金額(円)*/}
      {/*      </Tabs.Trigger>*/}
      {/*      <Tabs.Trigger*/}
      {/*        value="percentage"*/}
      {/*        fontWeight={'bold'}*/}
      {/*        className={selectedTab === 'percentage' ? 'income' : ''}*/}
      {/*      >*/}
      {/*        割合(%)*/}
      {/*      </Tabs.Trigger>*/}
      {/*    </Tabs.List>*/}
      {/*  </Tabs.Root>*/}
      {/*</Box>*/}
      {/* チャート */}
      {useFixedBoardChart ? (
        <BoardChartFixed flows={flows} />
      ) : (
        <BoardChart flows={flows} />
      )}
      <Box
        mb={3}
        display={{ base: 'none', md: 'flex' }}
        justifyContent="flex-end"
      >
        <button
          type="button"
          id="copy-image-btn"
          onClick={handleCopyImage}
          style={{
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '8px 16px',
            background: '#fff',
            cursor: 'pointer',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#888';
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#888';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#ccc';
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#ccc';
          }}
        >
          {copied ? (
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              {/* コピー済みアイコン（チェックマーク） */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                role="img"
                aria-label="コピー完了アイコン"
              >
                <title>コピー完了アイコン</title>
                <defs>
                  <linearGradient
                    id="copied-gradient"
                    x1="0"
                    y1="0"
                    x2="28"
                    y2="0"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FDD2F8" />
                    <stop offset="1" stopColor="#A6D1FF" />
                  </linearGradient>
                </defs>
                <circle cx="14" cy="14" r="14" fill="url(#copied-gradient)" />
                <path
                  d="M8 15l4 4 8-8"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span
                style={{
                  marginLeft: 8,
                  color: '#A6D1FF',
                  fontWeight: 500,
                  width: 140,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                コピーしました
              </span>
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              {/* コピーアイコン */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                role="img"
                aria-label="コピーアイコン"
              >
                <title>コピーアイコン</title>
                <rect
                  x="4"
                  y="7"
                  width="10"
                  height="10"
                  rx="2"
                  stroke="#555"
                  strokeWidth="2"
                />
                <rect
                  x="7"
                  y="5"
                  width="10"
                  height="10"
                  rx="2"
                  stroke="#555"
                  strokeWidth="2"
                  opacity="0.5"
                />
              </svg>

              <span
                style={{
                  marginLeft: 8,
                  width: 140,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                画像としてコピー
              </span>
            </span>
          )}
        </button>
      </Box>
    </BoardContainer>
  );
}
