package kr.campus.mapper;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import kr.campus.domain.ItemVO;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("file:src/main/webapp/WEB-INF/spring/root-context.xml")
public class AdminMapperTests {

   @Autowired
   private AdminMapper mapper;
   
   /* 상품 등록 */
   @Test
   public void itemsEnrollTest() throws Exception{
      
      ItemVO items = new ItemVO();
      
      items.setItemCode("15");
      items.setItemName("테스트랑꼐");
      items.setPrice(23000);
      items.setQuantity(10);
      items.setRatings(5);
      items.setCategory("2");
      items.setPurchases(114);
      items.setReviewno(2);
      items.setThumbNail("사진");
      
      mapper.itemsEnroll(items);
   }
}