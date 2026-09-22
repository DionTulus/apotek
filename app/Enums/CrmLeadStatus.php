<?php

namespace App\Enums;

enum CrmLeadStatus: string
{
    case NEW = 'new';
    case CONTACTED = 'contacted';
    case CONVERTED = 'converted';
    case LOST = 'lost';
}
