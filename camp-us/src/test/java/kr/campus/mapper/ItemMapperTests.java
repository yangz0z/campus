package kr.campus.mapper;


import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import kr.campus.domain.Criteria;
import kr.campus.domain.ItemVO;
import lombok.Setter;
import lombok.extern.log4j.Log4j;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("file:src/main/webapp/WEB-INF/spring/root-context.xml")
@Log4j
public class ItemMapperTests {
	@Setter(onMethod_ = @Autowired)
	private ItemMapper mapper;

//	@Test
//	public void testGetList() {
//		mapper.itemList().forEach(item -> log.info(item));
//	}
	
//	@Test
//	public void testPaging() {
//		String category = "picnic";
//		Criteria cri = new Criteria(2, 12, category);
//		
//		List<ItemVO> itemList = mapper.itemList(cri);
//		itemList.forEach(item -> log.info(item));
//		
//	}
	
//	@Test
//	public void testNewList() {
//		String category = "";
//		Criteria cri = new Criteria(1, 12, category);
//		
//		List<ItemVO> newList = mapper.newList(cri);
//		newList.forEach(item -> log.info(item));
//		
//	}
	
	@Test
	public void testRecommendedItems() {
		List<ItemVO> recommendedItems = mapper.recommendedItems();
		recommendedItems.forEach(item -> log.info(item));
	}
	
//	@Test
//	public void testReadItem() {
//		ItemVO item = mapper.readItem("TE0012");
//		log.info(item);
//	}
}
