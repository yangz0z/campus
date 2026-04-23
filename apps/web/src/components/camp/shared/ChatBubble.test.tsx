// ChatBubble 컴포넌트 단위 테스트:
// - variant 분기(question/answer)에 따른 아이콘/정렬 변화
// - interactive 모드에서 "수정" 힌트 표시
// - children 렌더링 검증
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ChatBubble from './ChatBubble';

describe('ChatBubble', () => {
  it('children 텍스트를 렌더함', () => {
    render(<ChatBubble variant="question">어디로 캠핑 가세요?</ChatBubble>);

    expect(screen.getByText('어디로 캠핑 가세요?')).toBeInTheDocument();
  });

  it('variant=question이면 🏕️ 아이콘을 함께 렌더', () => {
    render(<ChatBubble variant="question">질문</ChatBubble>);

    expect(screen.getByText('🏕️')).toBeInTheDocument();
  });

  it('variant=answer면 🏕️ 아이콘을 렌더하지 않음', () => {
    render(<ChatBubble variant="answer">답변</ChatBubble>);

    expect(screen.queryByText('🏕️')).not.toBeInTheDocument();
    expect(screen.getByText('답변')).toBeInTheDocument();
  });

  it('interactive가 true면 "수정" 힌트를 표시', () => {
    render(<ChatBubble variant="answer" interactive>답변</ChatBubble>);

    expect(screen.getByText('수정')).toBeInTheDocument();
  });
});
