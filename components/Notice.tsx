import { Alert } from '@mantine/core';
import { InfoIcon } from 'lucide-react';

export function Notice() {
  return (
    <Alert title="開発中" icon={<InfoIcon size={18} />}>
      Polimoney(ポリマネー)は開発中であり、表示内容は頻繁に更新または修正されることがあります。
      <br />
      収支報告書に基づいてレポートを作成していますが、表示内容が正確であることを保証するものではありません。
    </Alert>
  );
}
