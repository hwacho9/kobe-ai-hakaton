# 최신 Node.js LTS 버전 사용
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package.json package-lock.json* ./
RUN npm ci

# 소스 코드 복사
COPY . .

# public 디렉토리가 없으면 생성
RUN mkdir -p public

# 타입스크립트 관련 패키지 설치 확인
RUN npm list typescript || npm install typescript
RUN npm list @types/node || npm install @types/node
RUN npm list @types/react || npm install @types/react
RUN npm list @types/react-dom || npm install @types/react-dom

# node-fetch 설치 (필요한 경우)
RUN npm install node-fetch

# 빌드
RUN npm run build

# 프로덕션 이미지
FROM node:20-alpine AS runner
WORKDIR /app

# 필요한 파일만 복사
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src ./src

# 서버 실행
CMD ["npm", "start"]