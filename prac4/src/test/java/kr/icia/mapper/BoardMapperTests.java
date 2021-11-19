package kr.icia.mapper;

import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import lombok.Setter;
import lombok.extern.log4j.Log4j;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("file:src/main/webapp/WEB-INF/spring/root-context.xml")
@Log4j
public class BoardMapperTests {

	@Setter(onMethod_ = @Autowired)
	private BoardMapper mapper;
	
//	@Test
//	public void testGetList() {
//		mapper.getList().forEach(board -> log.info(board));
//	}
	
//	@Test
//	public void testInsert() {
//		BoardVO board = new BoardVO();
//		board.setTitle("insert title");
//		board.setContent("insert content");
//		board.setWriter("insert writer");
//		
//		mapper.insert(board);
//		log.info(board);
//	}
	
//	@Test
//	public void testInsertSelectKey() {
//		BoardVO board = new BoardVO();
//		board.setTitle("insert title selectKey");
//		board.setContent("insert content selectKey");
//		board.setWriter("insert writer selectKey");
//		
//		mapper.insertSelectKey(board);
//		log.info(board);
//	}
	
//	@Test
//	public void testRead() {
//		BoardVO board = mapper.read(21L);
//		log.info(board);
//	}
	
//	@Test
//	public void testDelete() {
//		log.info("delete cnt: " + mapper.delete(22L));
//	}
	
//	@Test
//	public void testUpdate() {
//		BoardVO board = new BoardVO();
//		board.setBno(5L);
//		board.setTitle("update title");
//		board.setContent("update content");
//		board.setWriter("update writer");
//		
//		int count = mapper.update(board);
//		log.info("update cnt: " + count);
//	}
	
//	@Test
//	public void testPaging() {
//		Criteria cri = new Criteria();
//		
//		List<BoardVO> list = mapper.getListWithPaging(cri);
//		list.forEach(board->log.info(board.getBno()));
//	}
}
