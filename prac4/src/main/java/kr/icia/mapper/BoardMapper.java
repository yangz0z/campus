package kr.icia.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import kr.icia.domain.BoardVO;
import kr.icia.domain.Criteria;

public interface BoardMapper {
	public List<BoardVO> getList();
	
	public void insert(BoardVO board);
	
	public void insertSelectKey (BoardVO board);
	
	public BoardVO read(Long bno);
	
	public int delete(Long bno);
	
	public int update(BoardVO board);
	
	public List<BoardVO> getListWithPaging(Criteria cri);
	
	public int getTotalCount(Criteria cri);
	
	public int updateReplyCnt(@Param("bno") Long bno, @Param("amount") int amount);
}
