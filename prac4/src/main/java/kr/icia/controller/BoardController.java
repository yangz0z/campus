package kr.icia.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import kr.icia.domain.BoardAttachVO;
import kr.icia.domain.BoardVO;
import kr.icia.domain.Criteria;
import kr.icia.domain.PageDTO;
import kr.icia.service.BoardService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@Controller
@RequestMapping("/board/*")
@AllArgsConstructor
public class BoardController {
	private BoardService service;
	
	@GetMapping("/list")
	public void list(Model model, Criteria cri) {
		//log.info("list");
		model.addAttribute("list", service.getList(cri));
		int total = service.getTotal(cri);
		//log.info("total");
		model.addAttribute("pageMaker", new PageDTO(cri, total));
	}
	
	@GetMapping("/register")
	@PreAuthorize("isAuthenticated()")
	public void register() {
		//이동할 주소를 리턴하지 않으면 요청한 이름(register)으로 된 jsp 파일을 찾음
	}
	
	@PostMapping("/register")
	@PreAuthorize("isAuthenticated()")
	public String register(BoardVO board, RedirectAttributes rttr) {
		log.info("register: " + board);
		service.register(board);
		rttr.addFlashAttribute("result", board.getBno());
//		if(board.getAttachList() != null) {
//			board.getAttachList().forEach(attach->log.info(attach));
//		}
		return "redirect:/board/list";
	}
	
	@GetMapping({"/get", "/modify"})
	public void get(@RequestParam("bno") Long bno, @ModelAttribute("cri") Criteria cri, Model model) {
		log.info("get or modify");
		model.addAttribute("board", service.get(bno));
	}
	
	@PostMapping("/modify")
	@PreAuthorize("principal.username== #board.writer")
	public String modify(BoardVO board, Criteria cri, RedirectAttributes rttr) {
		log.info("modify: "+board);
		if(service.modify(board)) {
			rttr.addFlashAttribute("result", "success");
		}
		rttr.addAttribute("pageNum", cri.getPageNum());
		rttr.addAttribute("amount", cri.getAmount());
		rttr.addAttribute("type", cri.getType());
		rttr.addAttribute("keyword", cri.getKeyword());
		return "redirect:/board/list";
	}
	
	@PostMapping("/remove")
	@PreAuthorize("principal.username== #writer")
	public String remove(@RequestParam("bno") Long bno, Criteria cri, RedirectAttributes rttr, String writer) {
		log.info("remove......" + bno);
		
		List<BoardAttachVO> attachList = service.getAttachList(bno);
		
		if (service.remove(bno)) {
			deleteFiles(attachList);
			rttr.addFlashAttribute("result", "success");
		}
//		rttr.addAttribute("pageNum", cri.getPageNum());
//		rttr.addAttribute("amount", cri.getAmount());
//		rttr.addAttribute("type", cri.getType());
//		rttr.addAttribute("keyword", cri.getKeyword());
		return "redirect:/board/list"+cri.getListLink();
	}
	
	@GetMapping(value="/getAttachList", produces=MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public ResponseEntity<List<BoardAttachVO>> getAttachList(Long bno) {
		log.info("getAttachList: " + bno);
		return new ResponseEntity<>(service.getAttachList(bno), HttpStatus.OK);
	}
	
	private void deleteFiles(List<BoardAttachVO> attachList) {
		if (attachList == null || attachList.size() == 0) {
			return;
		}
		
		log.info("delete attach file......");
		log.info(attachList);
		
		attachList.forEach(attach->{
			try {
				Path file = Paths.get("c:\\upload\\"+attach.getUploadPath()+"\\"+attach.getUuid()+"_"+attach.getFileName());
				Files.deleteIfExists(file);
			} catch (Exception e) {
				e.printStackTrace();
			}
		});
	}
}
