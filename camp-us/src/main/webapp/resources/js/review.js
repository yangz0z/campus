/**
 * 
 */
 
 console.log("Review module......");
 
 var reviewService = (function() {
 	function insert(review, callback, error) {
 		console.log("add review......");
 		
 		$.ajax({
 			type: 'post',
 			url: 'review/new',
 			data: JSON.stringify(review),
 			contentType: "application/json; charset=utf-8",
 			success: function(result, status, xhr) {
 				if (callback) {
 					callback(status);
 				}
 			},
 			error: function(xhr, status, er) {
 				if (error) {
 					error(er);
 				}
 			}
 		});
 	}
 	
 	function reviewList(param, callback, error) {
 		console.log("get review list......");
		var itemCode = param.itemCode;
 		var page = param.page || 1; //페이지번호가 있으면 페이지번호, 없으면 1을 전달 	
 		$.getJSON("/review/pages/" + itemCode + "/" + page,
 			function(data) {
 				if (callback) {
 					callback(data);
 				}
 			}).fail(function(xhr, status, err) {
 				if (error) {
 					error(er);
 				}
 		});
 	}
 	
 	//댓글 시간표시
 	function displayTime(timeValue) {
  		var today = new Date();
 		var gap = today.getTime() - timeValue;
 		var dateObj = new Date(timeValue);
 		var str = "";
 		
 		if (gap < (1000*60*60*24)) {
 		//시간의 차이가 24시간 미만이라면
 			var hh = dateObj.getHours();
 			var mi = dateObj.getMinutes();
 			var ss = dateObj.getSeconds();
 		
 			return [ (hh>9?'':'0')+hh, ':', (mi>9?'':'0')+mi, ':', (ss>9?'':'0')+ss ].join('');
 			//배열 요소를 문자열로 변환. 시간에 포맷을 맞추기 위해서 0~9까지는 앞에 0을 추가로 표시
 		}
 		else {
 			var yy = dateObj.getFullYear();
 			var mm = dateObj.getMonth() + 1;
 			var dd = dateObj.getDate();
 			
 			return [ yy, '/', (mm>9?'':'0')+mm, '/', (dd>9?'':'0')+dd ].join('');
 		}
 	}
 	
 	//리뷰 읽기
 	function read(reviewNo, callback, error) {
 		$.read("/review/" + reviewNo, function(result) {
 				if (callback) {
 					callback(result);
 				}
 			}).fail(function(xhr, status, err) {
 				if (error) {
 					error(er);
 				}
 		});
 	}
 	
 	//댓글 수정처리
 	function update(review, callback, error) {
 		console.log("reviewNo: " + review.reviewNo);
 		$.ajax({
 			type : 'put',
 			url : '/review/' + review.reviewNo,
 			data : JSON.stringify(review),
 			contentType : "application/json;charset=utf-8",
 			success : function(result, status, xhr) {
 				if (callback) {
 					callback(result);
 				}
 			},
 			error : function(xhr, status, er) {
 				if (error) {
 					error(er);
 				}
 			}
 		});
 	}
 	
 	function delete(reviewNo, userID, callback, error) {
 		$.ajax({
 			type : 'delete',
 			url : '/review/' + reviewNo,
 			
 			data : JSON.stringify({reviewNo:reviewNo,userID:userID}),
 			contentType : "application/json; charset=utf-8",
 			
 			success : function(deleteResult, status, xhr) {
 				if (callback) {
 					callback(deleteResult);
 				}
 			},
 			error : function(xhr, status, er) {
 				if (error) {
 					error(er);
 				}	
			}
 		});
 	}
 	
 	return {
 		insert: insert,
 		reviewList: reviewList,
 		displayTime: displayTime,
 		read: read,
 		delete: delete,
 		update: update
 	};
 })();