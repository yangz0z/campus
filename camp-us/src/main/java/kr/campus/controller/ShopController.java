package kr.campus.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import kr.campus.service.ItemService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@Controller
@RequestMapping("/shop/*")
@AllArgsConstructor
public class ShopController {
	private ItemService service;
	
	@GetMapping("/modifyItem")
	public void modifyItem() {
	}
	
	@GetMapping("/registItem")
	public void registItem() {
	}
	
	@GetMapping("/readItem")
	public void readItem() {
	}
	
	@GetMapping("/itemList")
	public void itemList(Model model) {
		log.info("item list ......");
		model.addAttribute("itemList", service.itemList());
	}
	
	@GetMapping("/sale")
	public void sale() {
	}
}
