package kr.campus.controller;

import java.util.Locale;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@Controller
@RequestMapping("/user/*")
@AllArgsConstructor
public class UserController {
	
	
	
	@GetMapping("/cart")
	public void cart(Authentication authentication, Locale locale, Model model) {
		GetAuth.getAuth(authentication, model);
	}
	
	@GetMapping("/myCommunity")
	public void myCommunity() {
	}
	
	@GetMapping("/editProfile")
	public void myProfile() {
	}
	
	@GetMapping("/orderList")
	public void orderList() {
		
	}
	
	@GetMapping("/wishlist")
	public void wishlist(Authentication authentication, Locale locale, Model model) {
		GetAuth.getAuth(authentication, model);
	}
	
	@GetMapping("/order")
	public void order() {
	}
	
}