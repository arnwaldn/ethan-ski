# Copy all templates from awesome-llm-apps to ULTRA-CREATE templates

$srcBase = "C:\Claude-Code-Creation\temp\awesome-llm-apps"
$dstBase = "C:\Claude-Code-Creation\templates"

# Starter AI Agents
$starterMappings = @{
    "starter_ai_agents\ai_blog_to_podcast_agent" = "ai-blog-to-podcast"
    "starter_ai_agents\ai_breakup_recovery_agent" = "ai-breakup-recovery"
    "starter_ai_agents\ai_data_analysis_agent" = "ai-data-analysis"
    "starter_ai_agents\ai_data_visualisation_agent" = "ai-data-visualization"
    "starter_ai_agents\ai_life_insurance_advisor_agent" = "ai-life-insurance-advisor"
    "starter_ai_agents\ai_medical_imaging_agent" = "ai-medical-imaging"
    "starter_ai_agents\ai_meme_generator_agent_browseruse" = "ai-meme-generator"
    "starter_ai_agents\ai_music_generator_agent" = "ai-music-generator"
    "starter_ai_agents\ai_reasoning_agent" = "ai-reasoning-agent"
    "starter_ai_agents\ai_startup_trend_analysis_agent" = "ai-startup-trend-analysis"
    "starter_ai_agents\ai_travel_agent" = "ai-travel-agent"
    "starter_ai_agents\mixture_of_agents" = "mixture-of-agents"
    "starter_ai_agents\multimodal_ai_agent" = "multimodal-ai-agent"
    "starter_ai_agents\opeani_research_agent" = "openai-research-agent"
    "starter_ai_agents\web_scrapping_ai_agent" = "web-scraping-agent"
    "starter_ai_agents\xai_finance_agent" = "xai-finance-agent"
}

# Advanced Single Agents
$singleMappings = @{
    "advanced_ai_agents\single_agent_apps\ai_consultant_agent" = "ai-consultant"
    "advanced_ai_agents\single_agent_apps\ai_customer_support_agent" = "ai-customer-support"
    "advanced_ai_agents\single_agent_apps\ai_deep_research_agent" = "ai-deep-research"
    "advanced_ai_agents\single_agent_apps\ai_email_gtm_reachout_agent" = "ai-email-gtm"
    "advanced_ai_agents\single_agent_apps\ai_health_fitness_agent" = "ai-health-fitness"
    "advanced_ai_agents\single_agent_apps\ai_investment_agent" = "ai-investment"
    "advanced_ai_agents\single_agent_apps\ai_journalist_agent" = "ai-journalist"
    "advanced_ai_agents\single_agent_apps\ai_meeting_agent" = "ai-meeting"
    "advanced_ai_agents\single_agent_apps\ai_movie_production_agent" = "ai-movie-production"
    "advanced_ai_agents\single_agent_apps\ai_personal_finance_agent" = "ai-personal-finance"
    "advanced_ai_agents\single_agent_apps\ai_recipe_meal_planning_agent" = "ai-recipe-meal-planning"
    "advanced_ai_agents\single_agent_apps\ai_startup_insight_fire1_agent" = "ai-startup-insight"
    "advanced_ai_agents\single_agent_apps\ai_system_architect_r1" = "ai-system-architect"
    "advanced_ai_agents\single_agent_apps\windows_use_autonomous_agent" = "windows-autonomous-agent"
}

# Advanced Multi-Agent Apps
$multiMappings = @{
    "advanced_ai_agents\multi_agent_apps\ai_aqi_analysis_agent" = "ai-aqi-analysis"
    "advanced_ai_agents\multi_agent_apps\ai_domain_deep_research_agent" = "ai-domain-research"
    "advanced_ai_agents\multi_agent_apps\ai_financial_coach_agent" = "ai-financial-coach"
    "advanced_ai_agents\multi_agent_apps\ai_home_renovation_agent" = "ai-home-renovation"
    "advanced_ai_agents\multi_agent_apps\ai_mental_wellbeing_agent" = "ai-mental-wellbeing"
    "advanced_ai_agents\multi_agent_apps\ai_news_and_podcast_agents" = "ai-news-podcast"
    "advanced_ai_agents\multi_agent_apps\ai_Self-Evolving_agent" = "ai-self-evolving"
    "advanced_ai_agents\multi_agent_apps\ai_speech_trainer_agent" = "ai-speech-trainer"
    "advanced_ai_agents\multi_agent_apps\multi_agent_researcher" = "multi-agent-researcher"
    "advanced_ai_agents\multi_agent_apps\product_launch_intelligence_agent" = "product-launch-intel"
}

# Agent Teams
$teamMappings = @{
    "advanced_ai_agents\multi_agent_apps\agent_teams\ai_competitor_intelligence_agent_team" = "team-competitor-intel"
    "advanced_ai_agents\multi_agent_apps\agent_teams\ai_finance_agent_team" = "team-finance"
    "advanced_ai_agents\multi_agent_apps\agent_teams\ai_game_design_agent_team" = "team-game-design"
    "advanced_ai_agents\multi_agent_apps\agent_teams\ai_legal_agent_team" = "team-legal"
    "advanced_ai_agents\multi_agent_apps\agent_teams\ai_real_estate_agent_team" = "team-real-estate"
    "advanced_ai_agents\multi_agent_apps\agent_teams\ai_recruitment_agent_team" = "team-recruitment"
    "advanced_ai_agents\multi_agent_apps\agent_teams\ai_seo_audit_team" = "team-seo-audit"
    "advanced_ai_agents\multi_agent_apps\agent_teams\ai_services_agency" = "team-services-agency"
    "advanced_ai_agents\multi_agent_apps\agent_teams\ai_teaching_agent_team" = "team-teaching"
    "advanced_ai_agents\multi_agent_apps\agent_teams\ai_travel_planner_agent_team" = "team-travel-planner"
    "advanced_ai_agents\multi_agent_apps\agent_teams\multimodal_coding_agent_team" = "team-coding"
    "advanced_ai_agents\multi_agent_apps\agent_teams\multimodal_design_agent_team" = "team-design"
    "advanced_ai_agents\multi_agent_apps\agent_teams\multimodal_uiux_feedback_agent_team" = "team-uiux-feedback"
}

# Game Agents
$gameMappings = @{
    "advanced_ai_agents\autonomous_game_playing_agent_apps\ai_3dpygame_r1" = "ai-3d-pygame"
    "advanced_ai_agents\autonomous_game_playing_agent_apps\ai_chess_agent" = "ai-chess"
    "advanced_ai_agents\autonomous_game_playing_agent_apps\ai_tic_tac_toe_agent" = "ai-tic-tac-toe"
}

# RAG Tutorials
$ragMappings = @{
    "rag_tutorials\agentic_rag_embedding_gemma" = "rag-agentic-gemma"
    "rag_tutorials\agentic_rag_gpt5" = "rag-agentic-gpt5"
    "rag_tutorials\agentic_rag_math_agent" = "rag-agentic-math"
    "rag_tutorials\agentic_rag_with_reasoning" = "rag-agentic-reasoning"
    "rag_tutorials\ai_blog_search" = "rag-blog-search"
    "rag_tutorials\autonomous_rag" = "rag-autonomous"
    "rag_tutorials\contextualai_rag_agent" = "rag-contextual"
    "rag_tutorials\corrective_rag" = "rag-corrective"
    "rag_tutorials\deepseek_local_rag_agent" = "rag-deepseek-local"
    "rag_tutorials\gemini_agentic_rag" = "rag-gemini"
    "rag_tutorials\hybrid_search_rag" = "rag-hybrid-search"
    "rag_tutorials\llama3.1_local_rag" = "rag-llama-local"
    "rag_tutorials\local_hybrid_search_rag" = "rag-local-hybrid"
    "rag_tutorials\local_rag_agent" = "rag-local-agent"
    "rag_tutorials\qwen_local_rag" = "rag-qwen-local"
    "rag_tutorials\rag-as-a-service" = "rag-as-service"
    "rag_tutorials\rag_agent_cohere" = "rag-cohere"
    "rag_tutorials\rag_chain" = "rag-chain"
    "rag_tutorials\rag_database_routing" = "rag-db-routing"
    "rag_tutorials\vision_rag" = "rag-vision"
}

# MCP Agents
$mcpMappings = @{
    "mcp_ai_agents\ai_travel_planner_mcp_agent_team" = "mcp-travel-planner"
    "mcp_ai_agents\browser_mcp_agent" = "mcp-browser"
    "mcp_ai_agents\github_mcp_agent" = "mcp-github"
    "mcp_ai_agents\multi_mcp_agent" = "mcp-multi"
    "mcp_ai_agents\notion_mcp_agent" = "mcp-notion"
}

# Voice Agents
$voiceMappings = @{
    "voice_ai_agents\ai_audio_tour_agent" = "voice-audio-tour"
    "voice_ai_agents\customer_support_voice_agent" = "voice-customer-support"
    "voice_ai_agents\voice_rag_openaisdk" = "voice-rag"
}

# Chat with X
$chatMappings = @{
    "advanced_llm_apps\chat_with_X_tutorials\chat_with_github" = "chat-github"
    "advanced_llm_apps\chat_with_X_tutorials\chat_with_gmail" = "chat-gmail"
    "advanced_llm_apps\chat_with_X_tutorials\chat_with_pdf" = "chat-pdf"
    "advanced_llm_apps\chat_with_X_tutorials\chat_with_research_papers" = "chat-arxiv"
    "advanced_llm_apps\chat_with_X_tutorials\chat_with_substack" = "chat-substack"
    "advanced_llm_apps\chat_with_X_tutorials\chat_with_youtube_videos" = "chat-youtube"
    "advanced_llm_apps\chat_with_X_tutorials\streaming_ai_chatbot" = "streaming-chatbot"
}

# Memory Apps
$memoryMappings = @{
    "advanced_llm_apps\llm_apps_with_memory_tutorials\ai_arxiv_agent_memory" = "memory-arxiv"
    "advanced_llm_apps\llm_apps_with_memory_tutorials\ai_travel_agent_memory" = "memory-travel"
    "advanced_llm_apps\llm_apps_with_memory_tutorials\llama3_stateful_chat" = "memory-stateful-chat"
    "advanced_llm_apps\llm_apps_with_memory_tutorials\llm_app_personalized_memory" = "memory-personalized"
    "advanced_llm_apps\llm_apps_with_memory_tutorials\local_chatgpt_with_memory" = "memory-local-chatgpt"
    "advanced_llm_apps\llm_apps_with_memory_tutorials\multi_llm_memory" = "memory-multi-llm"
}

# Extras
$extraMappings = @{
    "advanced_llm_apps\llm_finetuning_tutorials\gemma3_finetuning" = "finetune-gemma"
    "advanced_llm_apps\llm_finetuning_tutorials\llama3.2_finetuning" = "finetune-llama"
    "advanced_llm_apps\llm_optimization_tools\toonify_token_optimization" = "token-optimization"
    "advanced_llm_apps\chat-with-tarots" = "chat-tarots"
    "advanced_llm_apps\cursor_ai_experiments" = "cursor-experiments"
    "advanced_llm_apps\gpt_oss_critique_improvement_loop" = "oss-critique"
    "advanced_llm_apps\resume_job_matcher" = "resume-job-matcher"
    "advanced_llm_apps\thinkpath_chatbot_app" = "thinkpath-chatbot"
    "ai_agent_framework_crash_course\google_adk_crash_course" = "google-adk-course"
    "ai_agent_framework_crash_course\openai_sdk_crash_course" = "openai-sdk-course"
}

# Combine all mappings
$allMappings = @{}
$starterMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }
$singleMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }
$multiMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }
$teamMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }
$gameMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }
$ragMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }
$mcpMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }
$voiceMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }
$chatMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }
$memoryMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }
$extraMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }

$count = 0
$total = $allMappings.Count

foreach ($mapping in $allMappings.GetEnumerator()) {
    $src = Join-Path $srcBase $mapping.Key
    $dst = Join-Path $dstBase $mapping.Value

    if (Test-Path $src) {
        Copy-Item -Path "$src\*" -Destination $dst -Recurse -Force -ErrorAction SilentlyContinue
        $count++
        Write-Host "[$count/$total] Copied: $($mapping.Value)"
    } else {
        Write-Host "[$count/$total] SKIP (not found): $($mapping.Key)"
    }
}

Write-Host ""
Write-Host "========================================="
Write-Host "COMPLETED: $count templates copied"
Write-Host "========================================="
