# Homebridge WeConn Plugin

## Introduction

This is a Homebridge plugin for WeComm Smart Plugs

## Tested devices:

- Ferguson Smart WiFi Plug (http://ferguson-digital.eu/inteligentny-dom-ferguson/inteligentna-wtyczka-smart-w-fi-plug/)

## Instalation

1. Install homebridge 
2. Install this plugin `npm install -g homebridge-weconn`

## Sample configuration:

        "accessories": [
            {
                "accessory": "WeConn",
                "name": "Plug name",
                "ip_address": "192.168.1.3",
                "mac": "adbd11235611"
            }
        ]