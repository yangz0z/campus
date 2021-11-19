package kr.icia.mapper;

import java.util.List;

import kr.icia.domain.BoardAttachVO;

public interface BoardAttachMapper {

	public void insert(BoardAttachVO vo);
	public void delete(String uuid);
	public List<BoardAttachVO> findByBno(Long bno);
	public void deleteAll(long bno);
	public List<BoardAttachVO> getOldFiles();
}
