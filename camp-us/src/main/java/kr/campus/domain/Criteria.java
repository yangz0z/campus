package kr.campus.domain;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class Criteria {

	private int pageNum; //현재 페이지번호
	private int amount; //페이지당 게시물 수
	private String category; //상품 카테고리
	
	public Criteria() { //한 페이지당 12개의 게시물을 보여줌
//		this(1,12,"");
		this.pageNum = 1;
		this.amount = 12;
		this.category = "";
	}
	
	public Criteria(int pageNum, int amount, String category) {
		this.pageNum = pageNum;
		this.amount = amount;
		this.category = category;
	}
}
