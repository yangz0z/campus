package kr.campus.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import kr.campus.domain.Criteria;
import kr.campus.domain.ItemVO;
import kr.campus.domain.PageDTO;
import kr.campus.service.AdminService;
import kr.campus.service.ItemService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@Controller
@RequestMapping("/shop/*")
@AllArgsConstructor
public class ShopController {
	private ItemService service;
	private AdminService adminService;

	@GetMapping("/modifyItem")
	public void modifyItem() {
	}

	@GetMapping("/registItem")
	public void registItem() {
	}

	// 단순 1회성 RedirectAttributes Model 화면 이동 안한다면 계속 유지
	@PostMapping("/registItem")
	public ResponseEntity<String> registItem(ItemVO items, RedirectAttributes rttr) {
		log.info("registItem : " + items);
		log.warn("registItem : " + items);

//	    service.registItem(shop); rttr.addAllAttributes("result", shop.getItemCode());
		try {
			adminService.itemsEnroll(items);
		} catch (Exception e) {
			log.info("error : " + e.getMessage());
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		// rttr.addFlashAttribute("result",items.getItemcode());
		// 리다이렉트 시키면서 1회용 값을 전달.

		return new ResponseEntity<String>("succuess", HttpStatus.OK);

	}

	@GetMapping("/readItem")
	public void readItem() {
	}

	@GetMapping("/itemList")
	public void itemList(Model model, Criteria cri) {
		log.info("item list ......");
		model.addAttribute("itemList", service.itemList(cri));

		int total = service.getTotal(cri);
		log.info("total");
		model.addAttribute("pageMaker", new PageDTO(cri, total));
	}

//	@GetMapping("/newList")
//	public void newList(Model model, Criteria cri) {
//		log.info("new item list ......");
//		model.addAttribute("itemList", service.itemList(cri));
//
//		int total = service.getTotal(cri);
//		log.info("total");
//		model.addAttribute("pageMaker", new PageDTO(cri, total));
//	}
}
