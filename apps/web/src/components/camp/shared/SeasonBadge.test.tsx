// SeasonBadge 컴포넌트 단위 테스트:
// - SEASONS 상수 조회 분기 검증 (유효/무효 seasonId)
// - selected prop의 스타일 변경 검증 (Tailwind 클래스 검증)
// - onClick 콜백 호출 검증 (userEvent)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SeasonBadge from './SeasonBadge';

describe('SeasonBadge', () => {
  it('유효한 seasonId를 주면 해당 계절의 이름과 아이콘을 렌더', () => {
    render(<SeasonBadge seasonId="spring" />);

    expect(screen.getByRole('button', { name: /봄/ })).toBeInTheDocument();
    expect(screen.getByText('🌸')).toBeInTheDocument();
  });

  it('알 수 없는 seasonId면 null을 반환하여 아무것도 렌더하지 않음', () => {
    const { container } = render(<SeasonBadge seasonId="invalid-season" />);

    // button 자체가 존재하지 않아야 함
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it('selected가 false면 회색 텍스트 클래스를 적용', () => {
    render(<SeasonBadge seasonId="summer" selected={false} />);

    const button = screen.getByRole('button', { name: /여름/ });
    // selected=false 분기: 'border-earth-200 bg-earth-50 text-gray-400'
    expect(button).toHaveClass('text-gray-400');
    // selected=true 분기의 색상 클래스는 없어야 함
    expect(button).not.toHaveClass('text-blue-700');
  });

  it('클릭 시 onClick 콜백이 호출됨', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<SeasonBadge seasonId="fall" onClick={onClick} />);
    await user.click(screen.getByRole('button', { name: /가을/ }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
