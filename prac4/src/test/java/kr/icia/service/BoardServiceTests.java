package kr.icia.service;

import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import lombok.Setter;
import lombok.extern.log4j.Log4j;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("file:src/main/webapp/WEB-INF/spring/root-context.xml")
@Log4j
public class BoardServiceTests {
	@Setter(onMethod_ = @Autowired)
	private BoardService service;
	
//	@Test
//	public void testRegister() {
//		BoardVO board = new BoardVO();
//		board.setTitle("new service title");
//		board.setContent("new service content");
//		board.setWriter("new service writer");
//		
//		service.register(board);
//		log.info("생성된 게시물 번호 " + board.getBno());
//	}
	
//	@Test
//	public void testGetList2() {
//		service.getList(new Criteria(2,10)).forEach(board->log.info(board));
//	}
}
