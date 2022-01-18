package kr.campus.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.campus.domain.CartListVO;
import kr.campus.domain.CartVO;
import kr.campus.mapper.CartMapper;
import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Log4j
@Service //로직처리를 위한 어노테이션
public class CartServiceImp implements CartService {

	@Setter(onMethod_ = @Autowired)
	private CartMapper mapper;
	
	@Override
	public int insert(CartVO cart) {
		log.info("insert cart service....");
		return mapper.insert(cart);
	}

	@Override
	public List<CartListVO> list(CartListVO cartList) {
		log.info("cart list service....");
		return mapper.list(cartList);
	}

	@Override
	public int delete(CartListVO cartList) {
		log.info("delete cart service...." + cartList);
		return mapper.delete(cartList);
	}

	@Override
	public void deleteAll(String userID) {
		log.info("delete all cart service...." + userID);
		mapper.deleteAll(userID);
	}

	@Override
	public int modify(CartVO cart) {
		log.info("modify cart service...." + cart);
		return mapper.modify(cart);
	}

	
}
