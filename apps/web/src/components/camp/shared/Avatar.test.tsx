// Avatar 컴포넌트 단위 테스트:
// - Testing Library 접근성 기반 쿼리(getByRole, getByText) 우선
// - 구현(className, DOM 구조)이 아닌 사용자가 보는 결과 검증
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('profileImage가 있으면 img 요소를 nickname alt로 렌더', () => {
    // Arrange - Act
    render(<Avatar nickname="테스터" profileImage="https://cdn/img.png" />);

    // Assert
    const img = screen.getByRole('img', { name: '테스터' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://cdn/img.png');
  });

  it('profileImage가 null이면 nickname 첫 글자를 이니셜로 렌더', () => {
    render(<Avatar nickname="테스터" profileImage={null} />);

    // img 요소는 렌더되지 않음
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    // 이니셜 "테"만 가시
    expect(screen.getByText('테')).toBeInTheDocument();
  });

  it('size prop을 width/height 스타일로 반영', () => {
    render(<Avatar nickname="A" profileImage={null} size={48} />);

    const initial = screen.getByText('A');
    expect(initial).toHaveStyle({ width: '48px', height: '48px' });
  });
});
