<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'biteship' => [
        'api_key' => env('BITESHIP_API_KEY'),
        'base_url' => env('BITESHIP_BASE_URL', 'https://api.biteship.com/v1'),
        'couriers' => env('BITESHIP_COURIERS', 'jne,jnt,sicepat,anteraja,tiki,ninja'),
        'origin' => [
            'contact_name' => env('BITESHIP_ORIGIN_CONTACT_NAME'),
            'contact_phone' => env('BITESHIP_ORIGIN_CONTACT_PHONE'),
            'contact_email' => env('BITESHIP_ORIGIN_CONTACT_EMAIL'),
            'organization' => env('BITESHIP_ORIGIN_ORGANIZATION'),
            'address' => env('BITESHIP_ORIGIN_ADDRESS'),
            'postal_code' => env('BITESHIP_ORIGIN_POSTAL_CODE'),
        ],
        'cod_disbursement_type' => env('BITESHIP_COD_DISBURSEMENT_TYPE', '7_days'),
        'webhook_header' => env('BITESHIP_WEBHOOK_HEADER', 'X-Biteship-Secret'),
        'webhook_secret' => env('BITESHIP_WEBHOOK_SECRET'),
    ],

];
