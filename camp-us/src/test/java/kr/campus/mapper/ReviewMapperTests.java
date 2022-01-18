package kr.campus.mapper;

import java.util.stream.IntStream;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import kr.campus.domain.ReviewVO;
import lombok.Setter;
import lombok.extern.log4j.Log4j;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("file:src/main/webapp/WEB-INF/spring/root-context.xml")
@Log4j
public class ReviewMapperTests {
	
	@Setter(onMethod_ = @Autowired)
	private ReviewMapper mapper;
	
	private String[] itemCodeArr = {"TE0012", "TE0011", "TE0010", "TE0009", "TE0008"};
	
	@Test
	public void testCreate() {
		IntStream.rangeClosed(1, 10).forEach(i -> {
			ReviewVO review = new ReviewVO();
			
			review.setItemCode(itemCodeArr[i % 5]);
			review.setContent("댓글 테스트" + i);
			review.setUserID("user00");
			
			mapper.insert(review);
		});
	}
}
