package kr.campus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import kr.campus.domain.Criteria;
import kr.campus.domain.ReviewVO;
import kr.campus.service.ReviewService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@RequestMapping("/review/")
@RestController
@Log4j
@AllArgsConstructor
public class ReviewController {

	private ReviewService service;

	//새 리뷰 작성
	@PostMapping(value = "/new", consumes = "application/json", produces = MediaType.TEXT_PLAIN_VALUE)
	@PreAuthorize("isAuthenticated()") //로그인한 사용자만 접근
	public ResponseEntity<String> create(@RequestBody ReviewVO review) {
		// @RequestBody 는 json형태로 받은 값을 객체로 변환함
		log.info("/review/new");
		log.info("ReviewVO: " + review);
		int insertCnt = service.insert(review);
		log.info("Review insert Count: " + insertCnt);

		return insertCnt == 1 ? new ResponseEntity<>("success", HttpStatus.OK)
				: new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	//리뷰 목록 가져오기
	@GetMapping(value="/pages/{itemCode}/{page}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<List<ReviewVO>> reviewList(@PathVariable("page") int page, @PathVariable("itemCode") String itemCode) {
		log.info("get review list......");
		Criteria cri = new Criteria(page, 10);
		log.info(cri);
		
		return new ResponseEntity<>(service.reviewList(cri, itemCode), HttpStatus.OK);
	}

	//리뷰 1개 읽기
	@GetMapping(value="/reviewNo", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("isAuthenticated()") //로그인한 사용자만 접근
	public ResponseEntity<ReviewVO> read(@PathVariable("reviewNo") int reviewNo) {
		log.info("read : " + reviewNo);
		return new ResponseEntity<>(service.read(reviewNo), HttpStatus.OK);
	}
	
	//리뷰 삭제
	@DeleteMapping(value="/reviewNo", produces = MediaType.TEXT_PLAIN_VALUE)
	@PreAuthorize("principal.userID == #review.userID")
	public ResponseEntity<String> delete(@PathVariable("reviewNo") int reviewNo, @RequestBody ReviewVO review) {
		log.info("delete : " + reviewNo);
		return service.delete(reviewNo) == 1 ?
				new ResponseEntity<>("success", HttpStatus.OK)
				: new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	//리뷰 수정
	@RequestMapping(method = RequestMethod.PATCH, value="/reviewNo", 
			consumes = "application/json", produces = MediaType.TEXT_PLAIN_VALUE)
	@PreAuthorize("principal.userID == #review.userID")
	public ResponseEntity<String> modify(@RequestBody ReviewVO review, @PathVariable("ReviewNo") int reviewNo) {
		review.setReviewNo(reviewNo);
		log.info("review No : " + reviewNo);
		log.info("update : " + review);
		return service.update(review) == 1 ?
				new ResponseEntity<>("success", HttpStatus.OK)
				: new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

}
