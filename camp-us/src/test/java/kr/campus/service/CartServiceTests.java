package kr.campus.service;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import kr.campus.domain.CartVO;
import lombok.Setter;
import lombok.extern.log4j.Log4j;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("file:src/main/webapp/WEB-INF/spring/root-context.xml")
@Log4j
public class CartServiceTests {

	@Setter(onMethod_ = @Autowired)
	private CartService service;
	
//	@Test
//	public void testInsert() {
//		CartVO cart = new CartVO();
//		cart.setItemCode("CP0001");
//		cart.setUserID("user00");
//		cart.setQuantity(2);
//		cart.setMoney(5000);
//		
//		service.insert(cart);
//		log.info("생성된 카트번호 : " + cart.getCartID());
//	}
	
	@Test
	public void testList() {
		
	}

}
