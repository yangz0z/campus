package kr.campus.controller;

import java.util.Locale;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import kr.campus.domain.Criteria;
import kr.campus.domain.PageDTO;
import kr.campus.service.ItemService;
import kr.campus.service.MemberService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@Controller
@RequestMapping("/shop/*")
@AllArgsConstructor
public class ShopController {
	private ItemService service;
	
	@GetMapping("/readItem")
	public void readItem(@RequestParam("itemCode") String itemcode, Authentication authentication, Model model) {
		log.info("read item");
		model.addAttribute("item", service.readItem(itemcode));
		GetAuth.getAuth(authentication, model); 
	}
	
	@GetMapping("/itemList")
	public void itemList(Model model, Criteria cri,Authentication authentication, Locale locale) {
		GetAuth.getAuth(authentication, model);
		log.info("item list ......");
		model.addAttribute("itemList", service.itemList(cri));

		int total = service.getTotal(cri);
		log.info("total");
		model.addAttribute("pageMaker", new PageDTO(cri, total));
	}
	
	@GetMapping("/newList")
	public void join(Authentication authentication, Locale locale, Model model) {
		GetAuth.getAuth(authentication, model);
	}

}