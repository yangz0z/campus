package kr.campus.controller;

import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import kr.campus.domain.CartVO;
import kr.campus.service.CartService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@Controller
@RequestMapping("/user/cart/*")
//@AllArgsConstructor
public class CartController {
	
	private CartService service;
	
/*	@PostMapping("/insert")
	public String insert(@ModelAttribute CartVO cart) {
		// @ModelAttribute : sumit된 form내용을 저장해서 전달받거나 다시 뷰로 넘겨서 출력하기 위해 사용
		// 컨트롤러가 return하는 모델에 파라미터로 전달한 오브젝트를 자동으로 추가해줌
		
		//로그인 여부 확인, 로그인 하지 않은 상태라면 로그인 창으로 이동
		String userID = null;
		if (userID == null) {
			return "redirect:/security/login";
		}
		cart.setUserID(userID);
		service.insert(cart);
		
		return "redirect:/user/cart";
	} */
	
}
