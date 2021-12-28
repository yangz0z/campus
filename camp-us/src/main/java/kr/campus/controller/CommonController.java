package kr.campus.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import kr.campus.domain.PageDTO;
import kr.campus.service.ItemService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@Controller
@RequestMapping("/common/*")
@AllArgsConstructor 
public class CommonController {
//	private CommonService service;
	private ItemService itemService;
	
	@GetMapping("/main")
	public void main(Model model) {
		log.info("recommended items list");
		model.addAttribute("recommendedItems", itemService.recommendedItems());
	}
	
	@GetMapping("/contact")
	public void contact() {
	}
	
	@GetMapping("/search")
	public void search() {
	}
	
	@GetMapping("/searchResult")
	public void searchResult() {
	}
}