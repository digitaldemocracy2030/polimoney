import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// demo-*.ts を対象にする
type Flow = {
  name: string;
  value: number;
  direction: string;
};
type Transaction = {
  category: string;
  amount: number;
  direction: string;
};

const dataDir = path.join(__dirname, '../data');
const demoFiles = fs
  .readdirSync(dataDir)
  .filter((f) => f.startsWith('demo-') && f.endsWith('.ts'));

let hasError = false;

async function main() {
  for (const file of demoFiles) {
    const filePath = path.join(dataDir, file);
    let mod: any;
    try {
      mod = await import(filePath);
    } catch (e) {
      console.error(`[${file}] 読み込み失敗: ${e}`);
      hasError = true;
      continue;
    }
    const flows: Flow[] = mod.flows || mod.default?.data?.[0]?.flows;
    const transactions: Transaction[] =
      mod.transactions || mod.default?.data?.[0]?.transactions;
    if (!flows || !transactions) {
      console.error(`[${file}] flows/transactions が見つかりません`);
      hasError = true;
      continue;
    }
    // Transaction を category ごとに集計
    const grouped: Record<string, number> = {};
    for (const t of transactions) {
      if (!grouped[t.category]) grouped[t.category] = 0;
      grouped[t.category] += t.amount;
    }
    // チェック
    let ok = true;
    for (const [cat, sum] of Object.entries(grouped)) {
      const flow = flows.find((f) => f.name === cat);
      if (!flow) {
        console.error(`[${file}] category='${cat}' の Flow が存在しません`);
        ok = false;
        hasError = true;
        continue;
      }
      if (flow.value !== sum) {
        console.error(
          `[${file}] category='${cat}' の合計値不一致: Transaction合計=${sum}, Flow.value=${flow.value}`,
        );
        ok = false;
        hasError = true;
      }
    }
    // Flow 側で Transaction がないもの
    for (const flow of flows) {
      if (!grouped[flow.name]) {
        console.warn(
          `[${file}] Flow.name='${flow.name}' に対応する Transaction がありません`,
        );
      }
    }
    if (ok) {
      console.log(`[${file}] OK`);
    }
  }
  if (hasError) process.exit(1);
}

main();
