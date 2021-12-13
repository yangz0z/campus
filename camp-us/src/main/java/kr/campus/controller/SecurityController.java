package kr.campus.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@Controller
@RequestMapping("/security/*")
@AllArgsConstructor
public class SecurityController {
	
	@GetMapping("/join")
	public void join() {
	}
	
	@GetMapping("/login")
	public void login() {
	}
	
	@GetMapping("/resetPassword")
	public void resetPassword() {
	}
}
