import { NextPageContext } from 'next';
import { devLog, devError } from '../src/utils/devUtils';

interface ErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

function Error({ statusCode, hasGetInitialPropsRun, err }: ErrorProps) {
  // 개발 환경에서만 상세 에러 로깅
  if (process.env.NODE_ENV === 'development') {
    devError('Page Error:', {
      statusCode,
      hasGetInitialPropsRun,
      err: err?.message,
      stack: err?.stack
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {statusCode
            ? `서버 에러 ${statusCode}가 발생했습니다`
            : '클라이언트 에러가 발생했습니다'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {statusCode === 404
            ? '요청하신 페이지를 찾을 수 없습니다.'
            : '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          페이지 새로고침
        </button>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  
  // 개발 환경에서만 에러 로깅
  if (process.env.NODE_ENV === 'development') {
    devLog('Error.getInitialProps called with:', {
      statusCode,
      errMessage: err?.message,
      hasRes: !!res,
      hasErr: !!err
    });
  }

  return { statusCode };
};

export default Error;