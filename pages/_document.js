import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Interactive Bus Arrival Prediction Prototype" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-slate-900 text-slate-100 min-h-screen antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
