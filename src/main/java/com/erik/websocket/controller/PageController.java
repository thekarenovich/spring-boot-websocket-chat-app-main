package com.erik.websocket.controller;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@Profile("dev")
public class PageController {

    @GetMapping("/dev")
    public void dev() {
        for (int i = 0; i <= 10; i++)
            System.out.println("HELLO-HELLO FAT BOY");
    }
}

