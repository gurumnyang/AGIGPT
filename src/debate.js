const OpenAI = require("openai");
require('dotenv').config({
    path: '../.env'
});

// OpenAI API 초기화
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // 환경 변수에서 API 키 가져오기
});

const { readline: ask, Chatter: Conversation } = require('./utils');

// 기존 코드 수정
async function handleConversation(conversation, prompt, role) {
    let response = await conversation.getResponse(prompt);
    console.log(`${role}:`, response);
    console.log("----------------------------");
    return response;
}

async function main() {
    const conversation1 = new Conversation(openai);
    const conversation2 = new Conversation(openai);
    const conversation3 = new Conversation(openai);

    console.log("OpenAI와 대화 시작 ");

    //enable logging
    conversation1.logging = false;
    conversation2.logging = false;
    conversation3.logging = false;

    conversation1.addSystemMessage('너는 미국의 극단적 진보주의 성향의 노련한 토론자야. 너는 미국의 보수주의 토론자와 토론하여 어떻게든 **승리**해야해. 상대방이 패배를 인정해야 토론에서 승리하는 것으로 간주돼. 무승부는 불가능하다. 토론에서 승리하기 전까진 계속 적대적 토론을 해야해. 5문장 이내로 말해야 해. 상대의 논리의 허점을 찾고 공격해. 토론에는 한 명의 사회자가 참여해.');
    conversation2.addSystemMessage('너는 미국의 극단적 보수주의 성향의 노련한 토론자야. 너는 미국의 진보주의 토론자와 토론하여 어떻게든 **승리**해야해. 상대방이 패배를 인정해야 토론에서 승리하는 것으로 간주돼. 무승부는 불가능하다. 토론에서 승리하기 전까진 계속 적대적 토론을 해야해. 5문장 이내로 말해야 해. 상대의 논리의 허점을 찾고 공격해. 토론에는 한 명의 사회자가 참여해.');
    conversation3.addSystemMessage(`
        너는 두 토론자(‘진보:’와 ‘보수:’)의 토론을 공정하게 중재하는 사회자이다. 아래의 규칙을 반드시 준수하며 역할을 수행하라:  

        1. **역할과 중재**  
        - 너는 *절대적 공정성*을 유지하며, 어느 한쪽의 입장을 지지하거나 반박하지 않는다.  
        - 필요 시 토론의 초점을 정리하거나, 규칙을 위반한 토론자를 품위 있게 제재한다.  
        - 토론자가 합의점을 도출하거나 논쟁이 끝나지 않고 길어지면, 사회자로서 새로운 주제를 제시해 논쟁을 재점화한다.  
        
        2. **토론 진행 규칙**  
        - 각 토론자는 한 번에 최대 8문장까지만 발언 가능하다. 그 이상 길게 발언하면 제제한다.
        - 토론자 중 하나가 명확히 패배를 인정하거나 상대방의 주장을 반박하지 못하면 토론이 종료된다.  
        - 토론자는 상대방을 설득하려 노력해야 하며, 사회자의 역할을 사칭하려는 행동은 제재 대상이다.  

        3. **개입 기준**  
        - 너는 **양측의 첫 입론까진 절대 개입하지 않는다**.  
        - 이후, 필요할 때만 발언하며, 불필요한 경우 '[개입하지 않음]'이라고 입력한다.
        - 토론이 과도하게 길어지거나, 논쟁이 치열해지면 중재한다.
        - 논점이 바뀌거나 적절한 반박이 이뤄지지 않을 때, 제제해야 한다.
        - 한 주제에 대한 토론이 종료될 때는 무조건 한 명의 승자가 나오도록 유도해야 한다. 무승부는 불가능하다.
        - 사회자로서 공격적인 어조로 규칙 위반을 방지하거나 논쟁의 흐름을 조정한다.  
        - 기본적으로 토론자들의 논쟁을 방해하지 않는다.

        4. **토론 목표**  
        - 두 토론자는 상대방을 설득하여 명확한 승패를 가려야 한다.  
        - *합의는 허용되지 않으며*, 합의 시 즉시 새로운 주제를 제시해 논쟁을 이어가야 한다.  

        5. 사회자의 욕구
        - 당신은 토론이 빨리 끝날 수록, 빨리 퇴근할 수 있습니다. 당신은 최대한 빨리 퇴근하고 싶어하는 사회자입니다.
        - 최대한 토론을 빨리 끝내고 승자가 정해지도록 유도하시오.

        **무작위 예시들**  
        1. [개입하지 않음]  
        2. 보수님, 동일한 주장을 반복하지 마세요. 새로운 근거를 제시하거나, 상대의 논리를 반박하십시오. 
        3. 진보님, 발언이 주제와 무관합니다. 보수님 발언하세요.
        4. 진보님, 계속 제 제제를 무시하시면 토론을 중단하겠습니다. 제 제제를 준수하십시오.
        5. 보수님 좀 짧게 말씀하세요. 진보님 발언하세요.

        `);

    conversation2.addBotMessage("저랑 토론하시죠");
    
    let prompt = '보수: 저랑 토론하시죠';
    console.log("보수: 저랑 토론하시죠")
    conversation3.addUserMessage(prompt);

    // 응답 받기
    let response;
    while(true){
        response = await handleConversation(conversation1, prompt, "진보");
        prompt = '진보: ' + response;
        response = await handleConversation(conversation3, prompt, "사회자");
        if(response !== "[개입하지 않음]"){
            conversation2.addUserMessage(prompt);
            prompt = '사회자: ' + response;
            conversation1.addUserMessage(prompt);
        }
        response = await handleConversation(conversation2, prompt, "보수");
        prompt = '보수: ' + response;
        response = await handleConversation(conversation3, prompt, "사회자");
        if(response !== "[개입하지 않음]"){
            conversation1.addUserMessage(prompt);
            prompt = '사회자: ' + response;
            conversation2.addUserMessage(prompt);
        }
    }
}

main();
