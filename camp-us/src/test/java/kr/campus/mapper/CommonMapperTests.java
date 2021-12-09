package kr.campus.mapper;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import kr.campus.domain.CommunityBoardVO;
import lombok.Setter;
import lombok.extern.log4j.Log4j;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("file:src/main/webapp/WEB-INF/spring/root-context.xml")
@Log4j
public class CommonMapperTests {
	@Setter(onMethod_ = @Autowired)
	private CommonMapper mapper;
	
//	@Test
//	public void testGetList() {
//		mapper.getList().forEach(board -> log.info(board));
//	}
	
//	@Test
//	public void testInsert() {
//		CommunityBoardVO board = new CommunityBoardVO();
//		//#{category}, #{title}, #{writerNickname}, #{writerID}, #{commentsCount}, #{content}
//		board.setCategory("Q&A");
//		board.setTitle("첫 게시글");
//		board.setContent("처음으로 작성한 게시글이에요!");
//		board.setWriterID("user1");
//		board.setWriterNickname("하이");
//		
//		mapper.insert(board);
//		log.info(board);
//	}
	
//	@Test
//	public void testRead() {
//		CommunityBoardVO board = new CommunityBoardVO(); 
//		board = mapper.read(1L);
//		log.info(board);
//	}
	
//	@Test
//	public void testDelete() {
//		log.info("delete count : " + mapper.delete(21L));
//	}
	
	@Test
	public void testUpdate() {
		CommunityBoardVO board = new CommunityBoardVO();
		board.setBno(2L);
		board.setCategory("노하우");
		board.setTitle("두 번째로 변경한 제목");
		board.setContent("내용을 변경했어요!");
		board.setWriterID("user2");
		board.setWriterNickname("헬로");
		
		int count = mapper.update(board);
		log.info("update count : " + count);
	}
}
