import { redirect } from 'next/navigation';

export default function NotFound() {
  redirect(
    process.env.NODE_ENV === 'production'
      ? 'https://polimoney.dd2030.org'
      : 'http://localhost:3000',
  );
}
