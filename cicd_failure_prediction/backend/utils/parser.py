import yaml
import re
from typing import Dict, Any, Optional

def parse_yml_file(file_content: str) -> Dict[str, Any]:
    """
    Parse a YAML file content and extract relevant features for CI/CD prediction.
    
    Args:
        file_content (str): Raw YAML file content
        
    Returns:
        Dict[str, Any]: Parsed features from the YAML file
    """
    try:
        # Parse YAML content
        yaml_data = yaml.safe_load(file_content)
        
        if not yaml_data:
            return {"error": "Empty or invalid YAML file"}
        
        # Extract features
        features = {
            "pipeline_tool": detect_pipeline_tool(yaml_data),
            "number_of_build_steps": count_build_steps(yaml_data),
            "environment_type": detect_environment_type(yaml_data),
            "build_trigger_type": detect_build_trigger(yaml_data),
            "has_test_stage": has_test_stage(yaml_data),
            "has_deploy_stage": has_deploy_stage(yaml_data),
            "number_of_dependencies": count_dependencies(yaml_data),
            "yaml_complexity": calculate_yaml_complexity(yaml_data),
            "raw_text": file_content  # Keep raw text for TF-IDF
        }
        
        return features
        
    except yaml.YAMLError as e:
        return {"error": f"YAML parsing error: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

def detect_pipeline_tool(yaml_data: Dict) -> str:
    """Detect which CI/CD tool this YAML is for"""
    if 'jobs' in yaml_data and 'on' in yaml_data:
        return 'github_actions'
    elif 'stages' in yaml_data or 'before_script' in yaml_data:
        return 'gitlab_ci'
    elif 'pipeline' in yaml_data or 'steps' in yaml_data:
        return 'azure_devops'
    elif 'version' in yaml_data and isinstance(yaml_data.get('version'), (int, float)):
        return 'circleci'
    elif 'language' in yaml_data or 'script' in yaml_data:
        return 'travis_ci'
    else:
        return 'unknown'

def count_build_steps(yaml_data: Dict) -> int:
    """Count the number of build steps in the pipeline"""
    step_count = 0
    
    # GitHub Actions
    if 'jobs' in yaml_data:
        for job in yaml_data['jobs'].values():
            if isinstance(job, dict) and 'steps' in job:
                step_count += len(job['steps'])
    
    # GitLab CI
    elif 'stages' in yaml_data:
        step_count = len(yaml_data['stages'])
    
    # Azure DevOps
    elif 'steps' in yaml_data:
        step_count = len(yaml_data['steps'])
    
    # CircleCI
    elif 'jobs' in yaml_data:
        for job in yaml_data['jobs'].values():
            if isinstance(job, dict) and 'steps' in job:
                step_count += len(job['steps'])
    
    return step_count

def detect_environment_type(yaml_data: Dict) -> str:
    """Detect the environment type (production, staging, development)"""
    yaml_str = str(yaml_data).lower()
    
    if any(keyword in yaml_str for keyword in ['prod', 'production', 'main', 'master']):
        return 'production'
    elif any(keyword in yaml_str for keyword in ['staging', 'stage', 'test']):
        return 'staging'
    elif any(keyword in yaml_str for keyword in ['dev', 'development', 'feature']):
        return 'development'
    else:
        return 'unknown'

def detect_build_trigger(yaml_data: Dict) -> str:
    """Detect what triggers the build"""
    if 'on' in yaml_data:
        trigger = yaml_data['on']
        if isinstance(trigger, dict):
            if 'push' in trigger:
                return 'push'
            elif 'pull_request' in trigger:
                return 'pull_request'
            elif 'schedule' in trigger:
                return 'scheduled'
        elif isinstance(trigger, str):
            return trigger
    
    return 'manual'

def has_test_stage(yaml_data: Dict) -> bool:
    """Check if pipeline has testing stage"""
    yaml_str = str(yaml_data).lower()
    return any(keyword in yaml_str for keyword in ['test', 'jest', 'pytest', 'junit', 'rspec', 'mocha'])

def has_deploy_stage(yaml_data: Dict) -> bool:
    """Check if pipeline has deployment stage"""
    yaml_str = str(yaml_data).lower()
    return any(keyword in yaml_str for keyword in ['deploy', 'deployment', 'release', 'publish'])

def count_dependencies(yaml_data: Dict) -> int:
    """Count approximate number of dependencies mentioned"""
    yaml_str = str(yaml_data).lower()
    
    # Look for common dependency indicators
    dependency_patterns = [
        r'npm install',
        r'pip install',
        r'yarn install',
        r'composer install',
        r'bundle install',
        r'go get',
        r'requirements\.txt',
        r'package\.json',
        r'pom\.xml',
        r'build\.gradle'
    ]
    
    dependency_count = 0
    for pattern in dependency_patterns:
        dependency_count += len(re.findall(pattern, yaml_str))
    
    return dependency_count

def calculate_yaml_complexity(yaml_data: Dict) -> int:
    """Calculate a complexity score based on YAML structure"""
    def count_nested_elements(obj, depth=0):
        if depth > 10:  # Prevent infinite recursion
            return 0
        
        count = 0
        if isinstance(obj, dict):
            count += len(obj)
            for value in obj.values():
                count += count_nested_elements(value, depth + 1)
        elif isinstance(obj, list):
            count += len(obj)
            for item in obj:
                count += count_nested_elements(item, depth + 1)
        
        return count
    
    return count_nested_elements(yaml_data)

def extract_manual_features(form_data: Dict) -> Dict[str, Any]:
    """
    Extract features from manual form input.
    
    Args:
        form_data (Dict): Form data from frontend
        
    Returns:
        Dict[str, Any]: Processed features
    """
    try:
        features = {
            "build_duration": float(form_data.get("build_duration", 0)),
            "number_of_dependencies": int(form_data.get("number_of_dependencies", 0)),
            "lines_of_code_changed": int(form_data.get("lines_of_code_changed", 0)),
            "commit_frequency": float(form_data.get("commit_frequency", 0)),
            "test_coverage": float(form_data.get("test_coverage", 0)),
            "number_of_build_steps": int(form_data.get("number_of_build_steps", 0)),
            "environment_type": form_data.get("environment_type", "unknown"),
            "build_trigger_type": form_data.get("build_trigger_type", "manual"),
            "previous_build_status": form_data.get("previous_build_status", "unknown"),
            "code_complexity_score": float(form_data.get("code_complexity_score", 0)),
            "pipeline_tool": form_data.get("pipeline_tool", "unknown")
        }
        
        return features
        
    except (ValueError, TypeError) as e:
        return {"error": f"Invalid form data: {str(e)}"}
