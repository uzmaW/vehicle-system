package com.inventory.module.command;

import io.github.cdimascio.dotenv.Dotenv;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import org.mindrot.jbcrypt.BCrypt;

public class UpdatePasswordCommand {

    public static void main(String[] args) throws Exception {
        if (args.length < 2) {
            System.out.println("Usage: UpdatePasswordCommand <email> <new-password>");
            System.out.println("Example: UpdatePasswordCommand admin@example.com MySecure123");
            System.exit(1);
        }

        String email = args[0];
        String newPassword = args[1];

        Dotenv dotenv = Dotenv.load();
        String dbUrl = dotenv.get("DB_URL");
        String dbUser = dotenv.get("DB_USERNAME");
        String dbPass = dotenv.get("DB_PASSWORD");

        if (dbUrl == null || dbUser == null || dbPass == null) {
            System.err.println("Missing in .env: DB_URL, DB_USERNAME, DB_PASSWORD");
            System.exit(1);
        }

        Class.forName("org.postgresql.Driver");
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPass)) {
            String sql = "SELECT id, uuid FROM users WHERE email = ?";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, email);
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) {
                        System.err.println("User not found: " + email);
                        System.exit(1);
                    }
                    long userId = rs.getLong("id");
                    String uuid = rs.getString("uuid");
                    String hashed = BCrypt.hashpw(newPassword, BCrypt.gensalt(10));
                    String updateSql = "UPDATE users SET password = ? WHERE id = ?";
                    try (PreparedStatement ups = conn.prepareStatement(updateSql)) {
                        ups.setString(1, hashed);
                        ups.setLong(2, userId);
                        ups.executeUpdate();
                        System.out.println("Password updated for: " + email + " (uuid: " + uuid + ")");
                    }
                }
            }
        }
    }
}