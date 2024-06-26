package com.bearbazzar.secondhandmarketbackend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.springframework.boot.autoconfigure.info.ProjectInfoProperties;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user")
@JsonDeserialize(builder = User.Builder.class)
public class User {
    @Id
    private String username;
    private Long studentId;
    @JsonIgnore
    private String password;
    @OneToOne(cascade = CascadeType.ALL)
    private Email email;
    private String phone;
    private String description;
    // Add this field to your User model
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonBackReference
    private List<Ask> asks = new ArrayList<>();
    public List<Ask> getAsks() {
        return asks;
    }
    public void addAsk(Ask ask) {
        if (asks == null) {
            asks = new ArrayList<>();
        }
        asks.add(ask);
        ask.setUser(this); // Set the user reference in the Ask entity
    }
    public void removeAsk(Ask ask) {
        if (asks != null) {
            asks.remove(ask);
        }
    }
    private boolean enabled = false;//later used to determine if the user is admin
    private User(Builder builder) {
        this.studentId = builder.studentId;
        this.username = builder.username;
        this.password = builder.password;
        this.email = new Email.Builder().email(builder.email).build();
        this.phone = builder.phone;
        this.description = builder.description;
    }
    public User(){}
    public String getDescription(){return description;}
    public String getUsername() {
        return username;
    }
    public String getPassword() {
        return password;
    }
    public Email getEmail(){
        return email;
    }
    public String getPhone(){
        return phone;
    }
    public void setDescription(String description){
        this.description = description;
    }

    public  void setPassword(String password){
        this.password = password;
    }
    public  void setEmail(String email){
        this.email.setEmail(email);
    }
    public  void setPhone(String phone){
        this.phone = phone;
    }
    public Long getStudentId(){
        return studentId;
    }
    public void setStudentId(Long studentId){
        this.studentId = studentId;
    }
    public static class Builder{
        @JsonProperty("studentId")
        Long studentId;
        @JsonProperty("username")
        String username;
        @JsonProperty("password")
        String password;
        @JsonProperty("email")
        String email;
        @JsonProperty("phone")
        String phone;
        @JsonProperty("description")
        String description;
        public Builder serDescription(String description){
            this.description = description;
            return this;
        }
        public Builder setUsername(String username){
            this.username = username;
            return this;
        }
        public Builder setPassword(String password){
            this.password = password;
            return this;
        }
        public Builder setEmail(String email){
            this.email = email;
            return this;
        }
        public Builder setPhone(String phone){
            this.phone = phone;
            return this;
        }
        public Builder setStudentId(Long studentId){
            this.studentId = studentId;
            return this;
        }
        public User build(){
            return new User(this);
        }
    }
}
