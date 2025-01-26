from typing import List

from typing import Dict, Any

def generate_questions_for_tags(tags: List[str]) -> List[Dict[str, Any]]:
    """
    Generate relevant multiple choice questions based on the selected mental health tags.
    """
    questions = []
    
    # Questions for Addiction
    if "Addiction" in tags:
        questions.extend([
            {
                "question": "How long have you been struggling with addiction?",
                "options": [
                    "Less than 6 months",
                    "6 months to 1 year",
                    "1-3 years",
                    "More than 3 years"
                ]
            },
            {
                "question": "What coping mechanisms have you tried so far?",
                "options": [
                    "Professional therapy/counseling",
                    "Support groups",
                    "Self-help strategies",
                    "Haven't tried any specific mechanisms"
                ]
            },
            {
                "question": "How has your addiction affected your daily life?",
                "options": [
                    "Minimal impact",
                    "Moderate impact on work/relationships",
                    "Significant impact on multiple areas",
                    "Severe disruption of daily functioning"
                ]
            }
        ])
    
    # Questions for Anxiety
    if "Anxiety" in tags:
        questions.extend([
            {
                "question": "What situations trigger your anxiety the most?",
                "options": [
                    "Social situations",
                    "Work/school-related stress",
                    "Health concerns",
                    "Financial matters"
                ]
            },
            {
                "question": "How do you typically cope with anxiety?",
                "options": [
                    "Breathing exercises",
                    "Physical exercise",
                    "Medication",
                    "Avoidance of triggers"
                ]
            },
            {
                "question": "What physical symptoms accompany your anxiety?",
                "options": [
                    "Rapid heartbeat",
                    "Sweating",
                    "Shortness of breath",
                    "Trembling/shaking"
                ]
            }
        ])
    
    # Questions for ADHD
    if "ADHD" in tags:
        questions.extend([
            {
                "question": "How does ADHD affect your daily routines?",
                "options": [
                    "Difficulty staying organized",
                    "Trouble completing tasks",
                    "Time management issues",
                    "All of the above"
                ]
            },
            {
                "question": "What strategies help manage your ADHD symptoms?",
                "options": [
                    "Using lists and reminders",
                    "Breaking tasks into smaller steps",
                    "Medication",
                    "Regular exercise"
                ]
            },
            {
                "question": "In which environment are your ADHD symptoms worse?",
                "options": [
                    "Noisy/crowded places",
                    "Quiet/isolated settings",
                    "High-pressure situations",
                    "Unstructured environments"
                ]
            }
        ])
    
    # Questions for Depression
    if "Depression" in tags:
        questions.extend([
            {
                "question": "How long have you been experiencing depression?",
                "options": [
                    "Less than a month",
                    "1-6 months",
                    "6 months to 1 year",
                    "More than 1 year"
                ]
            },
            {
                "question": "Which activities have become difficult to enjoy?",
                "options": [
                    "Social gatherings",
                    "Hobbies/interests",
                    "Work/study",
                    "All of the above"
                ]
            },
            {
                "question": "What changes have you noticed in your patterns?",
                "options": [
                    "Sleep disturbances",
                    "Changes in appetite",
                    "Both sleep and appetite changes",
                    "No significant changes"
                ]
            }
        ])
    
    # Questions for Personality
    if "Personality" in tags:
        questions.extend([
            {
                "question": "How do you typically respond to stress?",
                "options": [
                    "Become withdrawn",
                    "Get irritable/angry",
                    "Feel overwhelmed/anxious",
                    "Take action to solve problems"
                ]
            },
            {
                "question": "How does your personality affect relationships?",
                "options": [
                    "Difficulty forming close bonds",
                    "Conflicts due to communication style",
                    "Strong, stable relationships",
                    "Varies depending on the situation"
                ]
            },
            {
                "question": "What aspect of your personality interests you most?",
                "options": [
                    "Emotional responses",
                    "Social interactions",
                    "Decision-making style",
                    "Coping mechanisms"
                ]
            }
        ])
    
    # Questions for Goal Setting
    if "Goal Setting" in tags:
        questions.extend([
            {
                "question": "What is your main personal growth goal?",
                "options": [
                    "Career development",
                    "Better relationships",
                    "Health improvement",
                    "Personal fulfillment"
                ]
            },
            {
                "question": "What obstacles affect your goal achievement?",
                "options": [
                    "Lack of time",
                    "Limited resources",
                    "Self-doubt",
                    "External pressures"
                ]
            },
            {
                "question": "How do you approach large goals?",
                "options": [
                    "Break into smaller steps",
                    "Set deadlines",
                    "Seek support/guidance",
                    "Focus on the end result"
                ]
            }
        ])
    
    # Questions for Relationships
    if "Relationships" in tags:
        questions.extend([
            {
                "question": "What is your communication style in relationships?",
                "options": [
                    "Direct and assertive",
                    "Passive or reserved",
                    "Emotional and expressive",
                    "Varies by situation"
                ]
            },
            {
                "question": "What patterns do you notice in relationships?",
                "options": [
                    "Difficulty with trust",
                    "Fear of commitment",
                    "Codependency",
                    "Healthy boundaries"
                ]
            },
            {
                "question": "What relationship aspect is most challenging?",
                "options": [
                    "Communication",
                    "Trust",
                    "Intimacy",
                    "Conflict resolution"
                ]
            }
        ])
    
    # Questions for Family Life
    if "Family Life" in tags:
        questions.extend([
            {
                "question": "How would you describe your family dynamics?",
                "options": [
                    "Close-knit and supportive",
                    "Distant or disconnected",
                    "Complex/challenging",
                    "Changing/evolving"
                ]
            },
            {
                "question": "What is your main family challenge?",
                "options": [
                    "Communication issues",
                    "Conflicting values/beliefs",
                    "Time management",
                    "Financial stress"
                ]
            },
            {
                "question": "How do you handle family conflicts?",
                "options": [
                    "Open discussion",
                    "Avoid confrontation",
                    "Seek mediation",
                    "Take time to cool off"
                ]
            }
        ])
    
    # Questions for Parenting
    if "Parenting" in tags:
        questions.extend([
            {
                "question": "What parenting aspect is most challenging?",
                "options": [
                    "Discipline",
                    "Communication",
                    "Work-life balance",
                    "Meeting emotional needs"
                ]
            },
            {
                "question": "How would you describe your parenting style?",
                "options": [
                    "Authoritative",
                    "Permissive",
                    "Strict",
                    "Balanced/flexible"
                ]
            },
            {
                "question": "What parenting support do you have?",
                "options": [
                    "Family members",
                    "Parent groups",
                    "Professional guidance",
                    "Limited support"
                ]
            }
        ])
    
    # Questions for Happiness
    if "Happiness" in tags:
        questions.extend([
            {
                "question": "What brings you the most joy?",
                "options": [
                    "Relationships/family",
                    "Achievements/success",
                    "Hobbies/interests",
                    "Helping others"
                ]
            },
            {
                "question": "How do you define happiness?",
                "options": [
                    "Inner peace/contentment",
                    "Achievement of goals",
                    "Strong relationships",
                    "Life satisfaction"
                ]
            },
            {
                "question": "What prevents you from being happier?",
                "options": [
                    "External circumstances",
                    "Self-doubt",
                    "Past experiences",
                    "Unclear life direction"
                ]
            }
        ])
    
    # Questions for Positive Psychology
    if "Positive Psychology" in tags:
        questions.extend([
            {
                "question": "Which strength would you like to develop?",
                "options": [
                    "Emotional intelligence",
                    "Resilience",
                    "Leadership",
                    "Creativity"
                ]
            },
            {
                "question": "How do you practice gratitude?",
                "options": [
                    "Daily journaling",
                    "Verbal expression",
                    "Mental reflection",
                    "Acts of kindness"
                ]
            },
            {
                "question": "What gives you purpose and meaning?",
                "options": [
                    "Helping others",
                    "Personal growth",
                    "Creative expression",
                    "Achievement/success"
                ]
            }
        ])
    
    # Questions for Stopping Smoking
    if "Stopping Smoking" in tags:
        questions.extend([
            {
                "question": "What motivates you to quit smoking?",
                "options": [
                    "Health concerns",
                    "Family pressure",
                    "Financial reasons",
                    "Personal choice"
                ]
            },
            {
                "question": "What triggers your smoking?",
                "options": [
                    "Stress/anxiety",
                    "Social situations",
                    "After meals/breaks",
                    "Habit/routine"
                ]
            },
            {
                "question": "What quitting strategies have you tried?",
                "options": [
                    "Cold turkey",
                    "Nicotine replacement",
                    "Gradual reduction",
                    "Haven't tried yet"
                ]
            }
        ])
    
    # General questions that apply to any combination of tags
    questions.extend([
        {
            "question": "How long have you faced these challenges?",
            "options": [
                "Recently (< 6 months)",
                "Short-term (6-12 months)",
                "Medium-term (1-3 years)",
                "Long-term (> 3 years)"
            ]
        },
        {
            "question": "What support system do you have?",
            "options": [
                "Family and friends",
                "Professional help",
                "Support groups",
                "Limited support"
            ]
        },
        {
            "question": "What do you hope to achieve?",
            "options": [
                "Better understanding",
                "Coping strategies",
                "Symptom relief",
                "Life improvement"
            ]
        }
    ])
    
    return questions
