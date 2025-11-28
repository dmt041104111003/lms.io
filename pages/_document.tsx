import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Learning Management System - LMS" />
        <link rel="icon" type="image/png" href="/images/common/loading.png" />
        <link rel="shortcut icon" type="image/png" href="/images/common/loading.png" />
        <link rel="apple-touch-icon" href="/images/common/loading.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

