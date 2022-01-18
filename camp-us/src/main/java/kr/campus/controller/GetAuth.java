package kr.campus.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.ui.Model;

public class GetAuth {
	public static void getAuth(Authentication authentication,  Model model) {
		
		String userid = "";

		try {
			UserDetails userDetails = (UserDetails) authentication.getPrincipal();
			userid = userDetails.getUsername();// 시큐리티에서는 username이 id 
		} catch (Exception e) {
			// TODO: handle exception
		} finally {
			if (userid != null) {
				model.addAttribute("userid", userid);
			}
		}
	}
}