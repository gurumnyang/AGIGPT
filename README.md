# AGIGPT

## 개요
AGIGPT는 GPT 모델을 활용해 텍스트 생성, 문서 및 TODO 관리 등 다양한 기능을 제공하는 Node.js 기반 프로젝트입니다. Mongoose를 사용해 문서와 TODO 항목을 데이터베이스로 관리하며, OpenAI API와 연동해 GPT 기반 기능을 수행합니다.

## Overview
AGIGPT is a Node.js-based project that leverages the GPT model to provide various features such as text generation, document and TODO management. It uses Mongoose to manage documents and TODO items in a database and integrates with the OpenAI API to perform GPT-based functions.

## 주요 기능
- GPT 모델을 사용한 질문 응답(askGPT)
- 문서 작성, 열람, 수정, 삭제 등의 CRUD 기능
- TODO 항목 추가 및 완료 처리
- 에이전트를 활용한 단계적 작업 실행

## Key Features
- Question answering using the GPT model (askGPT)
- CRUD functions for document creation, viewing, editing, and deletion
- Adding and completing TODO items
- Step-by-step task execution using agents

## 설치
1. 저장소를 클론합니다.
2. 프로젝트 경로에서 `npm install`을 실행해 의존성을 설치합니다.
3. `.env` 파일을 생성하고 환경 변수를 설정합니다 (예: OPENAI_API_KEY 등). `.env_sample`을 참고하세요.

## Installation
1. Clone the repository.
2. Run `npm install` in the project directory to install dependencies.
3. Create a `.env` file and set environment variables (e.g., OPENAI_API_KEY). Refer to `.env_sample`.

## 사용법
1. `npm run start` 명령으로 서버를 실행합니다.
2. `.env`에 명시한 포트로 접속합니다. `localhost:{port}`
2. GPT 기능 및 문서, TODO 관련 명령을 호출해 작업을 진행합니다.

## Usage
1. Run the server with the command `npm run start`.
2. Access the server at the port specified in `.env`. `localhost:{port}`
3. Use GPT features and document, TODO related commands to perform tasks.

## 라이선스
이 프로젝트는 ISC 라이선스를 따릅니다.

## License
This project is licensed under the ISC License.
