package com.example.exam.util;

public class DevAdminTokenMain {
    public static void main(String[] args) throws Exception {
        // Generate a dev ADMIN token quickly without dealing with shell quoting.
        DevJwtGenerator.main(new String[]{"dev-admin", "ADMIN"});
    }
}
