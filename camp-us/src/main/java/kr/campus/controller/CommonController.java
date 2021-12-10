package kr.campus.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import kr.campus.service.CommunityBoardService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@Controller
@RequestMapping("/common/*")
@AllArgsConstructor 
public class CommonController {
//	private CommonService service;
	
	@GetMapping("/main")
	public void list(Model model) {
	}
}