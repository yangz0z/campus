package kr.campus.service;

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
public class CommunityBoardServiceTests {
	@Setter(onMethod_ = @Autowired)
	private CommunityBoardService service;
	
//	@Test
//	public void testRegister() {
//		CommunityBoardVO board = new CommunityBoardVO();
//		board.setCategory("Q&A");
//		board.setTitle("서비스 테스트 제목");
//		board.setContent("서비스 테스트 클래스를 확인해보기 위한 게시글입니다.");
//		board.setWriterID("임시");
//		board.setWriterNickname("닉네임");
//		
//		service.register(board);
//		log.info("생성된 게시물 번호 : " + board.getBno());
//	}
	
	@Test
	public void testGetList() {
		service.getList().forEach(board -> log.info(board));
	}
}
