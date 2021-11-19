package kr.icia.mapper;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import kr.icia.domain.Criteria;
import kr.icia.domain.ReplyVO;
import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Log4j
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("file:src/main/webapp/WEB-INF/spring/root-context.xml")
public class ReplyMapperTests {
	private Long[] bnoArr = {386L, 387L, 388L, 389L, 390L};
	
	@Setter(onMethod_= @Autowired)
	private ReplyMapper mapper;
	
//	@Test
//	public void testCreate() {
//		IntStream.rangeClosed(1, 10).forEach(i->{
//			ReplyVO vo = new ReplyVO();
//			
//			vo.setBno(bnoArr[i % 5]);
//			vo.setReply("댓글 테스트" + i);
//			vo.setReplyer("replyer" + i);
//			
//			mapper.insert(vo);
//		});
//	}
	
	@Test
	public void testList2() {
		
		Criteria cri = new Criteria(2,10);
		
		List<ReplyVO> replies = mapper.getListWithPaging(cri, 390L);
		
		replies.forEach(reply->log.info(reply));
	}
	
}
