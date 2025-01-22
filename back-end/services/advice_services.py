from typing import Dict, List, Any

def generate_advice(answers: List[Dict[str, str]], tags: List[str]) -> Dict[str, Any]:
    """
    Generate personalized advice based on user's answers and selected tags.
    
    Args:
        answers: List of dictionaries containing question and selected answer
        tags: List of selected mental health tags
    
    Returns:
        Dictionary containing personalized advice sections
    """
    advice = {
        "summary": "",
        "recommendations": [],
        "resources": [],
        "next_steps": []
    }
    
    # Analyze answers to generate personalized advice
    severity_indicators = {
        "high": False,
        "moderate": False,
        "low": False
    }
    
    # Check severity based on answers
    for answer in answers:
        if "significant impact" in answer["answer"].lower() or "severe" in answer["answer"].lower():
            severity_indicators["high"] = True
        elif "moderate" in answer["answer"].lower():
            severity_indicators["moderate"] = True
        elif "minimal" in answer["answer"].lower():
            severity_indicators["low"] = True
    
    # Generate summary based on severity and tags
    if severity_indicators["high"]:
        advice["summary"] = "Based on your responses, it appears you're experiencing significant challenges. It's important to know that seeking professional help is a sign of strength."
    elif severity_indicators["moderate"]:
        advice["summary"] = "Your responses indicate you're facing some moderate challenges. While these issues are manageable, professional guidance could be beneficial."
    else:
        advice["summary"] = "Your responses suggest you're dealing with mild challenges. This is a great time to develop coping strategies and preventive measures."

    # Generate tag-specific recommendations
    if "Anxiety" in tags:
        advice["recommendations"].extend([
            "Practice deep breathing exercises daily",
            "Consider mindfulness meditation",
            "Keep a worry journal to track triggers",
            "Establish a regular exercise routine"
        ])
        advice["resources"].append({
            "name": "Anxiety and Depression Association of America",
            "url": "https://adaa.org"
        })

    if "Depression" in tags:
        advice["recommendations"].extend([
            "Maintain a regular sleep schedule",
            "Set small, achievable daily goals",
            "Stay connected with supportive people",
            "Consider light therapy, especially during darker months"
        ])
        advice["resources"].append({
            "name": "National Institute of Mental Health - Depression",
            "url": "https://www.nimh.nih.gov/health/topics/depression"
        })

    if "ADHD" in tags:
        advice["recommendations"].extend([
            "Create structured daily routines",
            "Use organizational tools and reminders",
            "Break large tasks into smaller steps",
            "Minimize distractions in your workspace"
        ])
        advice["resources"].append({
            "name": "CHADD - ADHD Resource Center",
            "url": "https://chadd.org"
        })

    if "Addiction" in tags:
        advice["recommendations"].extend([
            "Build a strong support network",
            "Identify and avoid trigger situations",
            "Develop healthy coping mechanisms",
            "Consider joining support groups"
        ])
        advice["resources"].append({
            "name": "Substance Abuse and Mental Health Services Administration",
            "url": "https://www.samhsa.gov"
        })

    if "Relationships" in tags or "Family Life" in tags:
        advice["recommendations"].extend([
            "Practice active listening",
            "Set healthy boundaries",
            "Schedule regular quality time",
            "Consider family counseling"
        ])
        advice["resources"].append({
            "name": "The Gottman Institute - Relationship Resources",
            "url": "https://www.gottman.com"
        })

    if "Goal Setting" in tags or "Personal Growth" in tags:
        advice["recommendations"].extend([
            "Write down specific, measurable goals",
            "Create action plans with deadlines",
            "Track your progress regularly",
            "Celebrate small achievements"
        ])

    # Generate next steps based on severity and tags
    if severity_indicators["high"]:
        advice["next_steps"] = [
            "Schedule an appointment with a mental health professional",
            "Consider discussing medication options with a psychiatrist",
            "Join support groups for immediate community support",
            "Create a crisis plan with emergency contacts"
        ]
    elif severity_indicators["moderate"]:
        advice["next_steps"] = [
            "Research therapists in your area",
            "Start a daily self-care routine",
            "Read self-help books on your specific challenges",
            "Consider group therapy or support groups"
        ]
    else:
        advice["next_steps"] = [
            "Establish preventive self-care practices",
            "Learn more about mental health through reliable resources",
            "Build a support network",
            "Consider periodic check-ins with a counselor"
        ]

    # Add general resources
    advice["resources"].extend([
        {
            "name": "National Alliance on Mental Illness",
            "url": "https://www.nami.org"
        },
        {
            "name": "Psychology Today - Find a Therapist",
            "url": "https://www.psychologytoday.com/us/therapists"
        }
    ])

    return advice
