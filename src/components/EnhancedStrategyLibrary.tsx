import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Lock, 
  Unlock, 
  Target, 
  Mail, 
  Search, 
  MessageSquare,
  Zap,
  CheckCircle,
  Play,
  Clock
} from "lucide-react";

export interface Strategy {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: string;
  expectedResults: string;
  icon: string;
  fullGuide: string;
  keyTactics: string[];
  successMetrics: string[];
  commonMistakes: string[];
  toolsNeeded: string[];
}

interface EnhancedStrategyLibraryProps {
  onStrategySelect: (strategy: Strategy) => void;
  onStrategyLock: (strategyId: string) => void;
  selectedStrategy?: Strategy | null;
  lockedStrategy?: Strategy | null;
}

// Enhanced strategy data with comprehensive guides
export const MARKETING_STRATEGIES: Strategy[] = [
  {
    id: 'content-marketing',
    name: 'Content Marketing',
    description: 'Create valuable content to attract and engage your audience, building trust and authority in your niche',
    category: 'Content',
    difficulty: 'beginner',
    timeCommitment: '5-10 hours/week',
    expectedResults: 'Increased organic traffic, brand awareness, and lead generation',
    icon: 'BookOpen',
    fullGuide: `# Content Marketing Strategy Guide

## Overview
Content marketing is about creating and distributing valuable, relevant content to attract and engage your target audience. This strategy builds trust, establishes authority, and drives profitable customer action.

## Core Principles
1. **Value First**: Always provide value before asking for anything
2. **Consistency**: Regular publishing builds audience expectations
3. **Quality Over Quantity**: Better to publish less frequently with high quality
4. **Audience-Centric**: Create content your audience actually wants
5. **Multi-Format**: Use blogs, videos, podcasts, infographics, etc.

## Implementation Steps
### Phase 1: Foundation (Week 1-2)
- Define your content pillars (3-5 main topics)
- Research your audience's pain points and interests
- Set up content calendar and publishing schedule
- Choose primary content formats

### Phase 2: Creation (Week 3-8)
- Create pillar content pieces (comprehensive guides)
- Develop supporting content around each pillar
- Optimize all content for SEO
- Create content upgrade lead magnets

### Phase 3: Distribution (Week 9-12)
- Share across all relevant channels
- Repurpose content into different formats
- Engage with comments and feedback
- Build email list through content upgrades

## Advanced Tactics
- Content clusters for SEO
- Interactive content (quizzes, polls)
- User-generated content campaigns
- Content partnerships and guest posting`,
    keyTactics: [
      'Blog consistently (2-3x per week)',
      'Create comprehensive pillar pages',
      'Develop content upgrades for lead generation',
      'Repurpose content across multiple formats',
      'Build topic clusters for SEO authority'
    ],
    successMetrics: [
      'Organic traffic growth',
      'Time on page and engagement',
      'Email subscribers from content',
      'Social shares and comments',
      'Leads generated from content'
    ],
    commonMistakes: [
      'Publishing without a strategy',
      'Focusing on quantity over quality',
      'Not promoting content enough',
      'Ignoring SEO optimization',
      'Not measuring results'
    ],
    toolsNeeded: [
      'Content management system',
      'SEO tools (Ahrefs, SEMrush)',
      'Design tools (Canva, Figma)',
      'Analytics (Google Analytics)',
      'Email marketing platform'
    ]
  },
  {
    id: 'social-media',
    name: 'Social Media Marketing',
    description: 'Build community and engage with your audience on social platforms to increase brand awareness and drive traffic',
    category: 'Social',
    difficulty: 'beginner',
    timeCommitment: '3-7 hours/week',
    expectedResults: 'Increased brand awareness, community building, and direct customer engagement',
    icon: 'MessageSquare',
    fullGuide: `# Social Media Marketing Strategy Guide

## Overview
Social media marketing involves creating and sharing content on social platforms to achieve marketing and branding goals. It's about building relationships and communities around your brand.

## Platform Selection
### Choose 2-3 platforms maximum to start:
- **LinkedIn**: B2B, professional content, thought leadership
- **Twitter**: Real-time engagement, industry conversations, customer support
- **Instagram**: Visual content, lifestyle branding, younger demographics
- **TikTok**: Short-form video, viral content, Gen Z audience
- **Facebook**: Community building, local businesses, diverse demographics

## Content Strategy Framework
### 80/20 Rule
- 80% valuable, educational, entertaining content
- 20% promotional content about your product/service

### Content Pillars (Choose 4-5)
1. **Educational**: Tips, tutorials, industry insights
2. **Behind-the-scenes**: Company culture, process insights
3. **User-generated content**: Customer stories, testimonials
4. **Industry news**: Commentary on trends and news
5. **Personal**: Founder stories, team highlights

## Implementation Timeline
### Week 1-2: Setup & Strategy
- Optimize all social profiles
- Define brand voice and visual identity
- Create content calendar template
- Research hashtags and keywords

### Week 3-8: Content Creation & Posting
- Post consistently (daily on chosen platforms)
- Engage with followers and industry accounts
- Share user-generated content
- Run polls and ask questions

### Week 9-12: Community Building
- Host live sessions or Twitter Spaces
- Collaborate with other accounts
- Create shareable content series
- Launch hashtag campaigns`,
    keyTactics: [
      'Post consistently with a content calendar',
      'Engage authentically with your community',
      'Use platform-specific content formats',
      'Leverage hashtags and trending topics',
      'Share behind-the-scenes content'
    ],
    successMetrics: [
      'Follower growth rate',
      'Engagement rate (likes, comments, shares)',
      'Reach and impressions',
      'Click-through rate to website',
      'Brand mention sentiment'
    ],
    commonMistakes: [
      'Being too promotional',
      'Posting inconsistently',
      'Not engaging with followers',
      'Using the same content across all platforms',
      'Ignoring negative feedback'
    ],
    toolsNeeded: [
      'Social media scheduler (Buffer, Hootsuite)',
      'Design tools (Canva, Adobe Creative)',
      'Analytics tools (native platform analytics)',
      'Hashtag research tools',
      'Social listening tools'
    ]
  },
  {
    id: 'email-marketing',
    name: 'Email Marketing',
    description: 'Nurture leads and customers through targeted email campaigns to build relationships and drive sales',
    category: 'Email',
    difficulty: 'intermediate',
    timeCommitment: '4-8 hours/week',
    expectedResults: 'High ROI, direct customer communication, and increased customer lifetime value',
    icon: 'Mail',
    fullGuide: `# Email Marketing Strategy Guide

## Overview
Email marketing remains one of the highest ROI marketing channels. It's about building relationships, providing value, and guiding subscribers through your customer journey.

## Email Marketing Fundamentals
### List Building Strategies
1. **Lead Magnets**: Free resources in exchange for email addresses
2. **Content Upgrades**: Bonus content related to blog posts
3. **Exit-Intent Popups**: Capture visitors before they leave
4. **Social Media Promotion**: Drive followers to email signup
5. **Webinars and Events**: Collect emails during registration

### Email Types and Purposes
1. **Welcome Series**: Onboard new subscribers
2. **Newsletter**: Regular value-driven content
3. **Promotional**: Product launches, sales, offers
4. **Educational**: Tips, tutorials, industry insights
5. **Transactional**: Order confirmations, receipts
6. **Re-engagement**: Win back inactive subscribers

## Campaign Structure
### Welcome Email Series (5-7 emails)
- Email 1: Welcome and set expectations
- Email 2: Your story and mission
- Email 3: Best resources/content
- Email 4: Social proof and testimonials
- Email 5: Soft product introduction
- Email 6: FAQ and common objections
- Email 7: Special offer for new subscribers

### Weekly Newsletter Template
- Personal note or industry insight
- 2-3 valuable tips or resources
- Featured content or case study
- Community highlight or user story
- Soft CTA to your product/service

## Advanced Strategies
### Segmentation
- Demographic segmentation
- Behavioral segmentation
- Purchase history segmentation
- Engagement level segmentation

### Automation Workflows
- Welcome series for new subscribers
- Abandoned cart recovery
- Post-purchase follow-up
- Birthday and anniversary emails
- Re-engagement campaigns`,
    keyTactics: [
      'Create compelling lead magnets',
      'Write engaging subject lines',
      'Segment your email list',
      'Automate key email sequences',
      'A/B test everything'
    ],
    successMetrics: [
      'Open rate (industry average: 20-25%)',
      'Click-through rate (industry average: 2-5%)',
      'Conversion rate',
      'List growth rate',
      'Revenue per email'
    ],
    commonMistakes: [
      'Buying email lists',
      'Not segmenting subscribers',
      'Sending too many promotional emails',
      'Ignoring mobile optimization',
      'Not testing subject lines'
    ],
    toolsNeeded: [
      'Email service provider (Mailchimp, ConvertKit)',
      'Landing page builder',
      'Email design tools',
      'Analytics and tracking',
      'A/B testing tools'
    ]
  },
  {
    id: 'influencer-marketing',
    name: 'Influencer Marketing',
    description: 'Partner with influencers to reach new audiences and build credibility through authentic endorsements',
    category: 'Partnership',
    difficulty: 'intermediate',
    timeCommitment: '4-8 hours/week',
    expectedResults: 'Expanded reach, increased credibility, and access to engaged audiences',
    icon: 'MessageSquare',
    fullGuide: `# Influencer Marketing Strategy Guide

## Overview
Influencer marketing involves partnering with individuals who have established credibility and audience in your niche to promote your brand, products, or services.

## Types of Influencers
### By Audience Size
1. **Nano-influencers** (1K-10K): High engagement, niche audiences
2. **Micro-influencers** (10K-100K): Good engagement, affordable
3. **Macro-influencers** (100K-1M): Broader reach, higher costs
4. **Mega-influencers** (1M+): Maximum reach, premium pricing

### By Platform
- **Instagram**: Visual content, lifestyle brands
- **YouTube**: Long-form content, tutorials
- **TikTok**: Short-form video, younger audience
- **LinkedIn**: B2B, professional content
- **Twitter**: Real-time engagement, thought leadership

## Campaign Types
### Sponsored Content
- Influencer creates content featuring your product
- Clear disclosure required (#ad, #sponsored)
- Negotiate usage rights for your channels

### Product Seeding
- Send free products without guaranteed posts
- Build relationships for future partnerships
- Track organic mentions and engagement

### Brand Ambassadorships
- Long-term partnerships
- Consistent brand representation
- Deeper integration with brand values

### Takeovers and Collaborations
- Influencer takes over your social accounts
- Joint content creation
- Cross-promotion opportunities

## Implementation Process
### Phase 1: Strategy & Research
- Define campaign objectives
- Identify target audience
- Research relevant influencers
- Set budget and timeline

### Phase 2: Outreach & Negotiation
- Craft personalized outreach messages
- Negotiate terms and compensation
- Create clear campaign briefs
- Establish content guidelines

### Phase 3: Campaign Execution
- Monitor content creation process
- Ensure brand alignment
- Track performance metrics
- Engage with campaign content`,
    keyTactics: [
      'Choose influencers aligned with your brand values',
      'Focus on engagement rate over follower count',
      'Create clear campaign briefs and guidelines',
      'Build long-term relationships',
      'Track ROI and performance metrics'
    ],
    successMetrics: [
      'Reach and impressions',
      'Engagement rate on sponsored content',
      'Click-through rate to your website',
      'Conversions and sales attributed',
      'Brand mention sentiment'
    ],
    commonMistakes: [
      'Choosing influencers based only on follower count',
      'Not checking for fake followers',
      'Lack of clear campaign guidelines',
      'Not disclosing partnerships properly',
      'Focusing on vanity metrics only'
    ],
    toolsNeeded: [
      'Influencer discovery platforms',
      'Social media analytics tools',
      'Contract and payment management',
      'Campaign tracking tools',
      'Content approval workflows'
    ]
  },
  {
    id: 'affiliate-marketing',
    name: 'Affiliate Marketing',
    description: 'Build a network of partners to promote your products for commission, creating scalable revenue streams',
    category: 'Partnership',
    difficulty: 'advanced',
    timeCommitment: '6-10 hours/week',
    expectedResults: 'Scalable sales growth, expanded reach, and performance-based marketing',
    icon: 'Target',
    fullGuide: `# Affiliate Marketing Strategy Guide

## Overview
Affiliate marketing is a performance-based strategy where you partner with individuals or companies (affiliates) who promote your products in exchange for a commission on sales.

## Program Structure
### Commission Models
1. **Pay-per-Sale**: Commission on completed purchases
2. **Pay-per-Lead**: Payment for qualified leads
3. **Pay-per-Click**: Payment for traffic sent
4. **Tiered Commissions**: Higher rates for top performers

### Commission Rates by Industry
- **Digital Products**: 30-50%
- **Physical Products**: 5-15%
- **Services**: 10-30%
- **Software/SaaS**: 20-40%

## Affiliate Recruitment
### Target Affiliate Types
1. **Content Creators**: Bloggers, YouTubers
2. **Influencers**: Social media personalities
3. **Email Marketers**: Newsletter owners
4. **Coupon/Deal Sites**: Discount platforms
5. **Review Sites**: Product comparison sites

### Recruitment Strategies
- Reach out to existing customers
- Partner with complementary brands
- Join affiliate networks
- Attend industry events
- Create attractive program terms

## Program Management
### Affiliate Support
- Provide marketing materials
- Offer product training
- Share performance insights
- Regular communication
- Incentive programs and bonuses

### Performance Tracking
- Unique affiliate links
- Conversion tracking
- Attribution modeling
- Regular reporting
- Fraud prevention

## Implementation Timeline
### Month 1: Program Setup
- Choose affiliate platform/software
- Set commission structure
- Create marketing materials
- Develop program terms

### Month 2-3: Recruitment
- Launch recruitment campaign
- Onboard first affiliates
- Provide training and support
- Monitor initial performance

### Month 4-6: Optimization
- Analyze affiliate performance
- Optimize commission structure
- Expand successful partnerships
- Improve conversion rates`,
    keyTactics: [
      'Set competitive commission rates',
      'Provide excellent affiliate support',
      'Create high-converting marketing materials',
      'Focus on quality over quantity of affiliates',
      'Regularly communicate with top performers'
    ],
    successMetrics: [
      'Number of active affiliates',
      'Average order value from affiliates',
      'Affiliate-driven revenue',
      'Conversion rate by affiliate',
      'Customer lifetime value from affiliate traffic'
    ],
    commonMistakes: [
      'Setting commission rates too low',
      'Poor affiliate onboarding process',
      'Lack of marketing material support',
      'Not tracking performance properly',
      'Ignoring affiliate feedback'
    ],
    toolsNeeded: [
      'Affiliate tracking software',
      'Payment processing system',
      'Marketing material creation tools',
      'Analytics and reporting tools',
      'Communication platforms'
    ]
  },
  {
    id: 'seo-marketing',
    name: 'SEO Marketing',
    description: 'Optimize your website and content for search engines to drive organic traffic and improve visibility',
    category: 'SEO',
    difficulty: 'intermediate',
    timeCommitment: '6-12 hours/week',
    expectedResults: 'Increased organic traffic, better search rankings, and long-term visibility',
    icon: 'Search',
    fullGuide: `# SEO Marketing Strategy Guide

## Overview
SEO (Search Engine Optimization) is about optimizing your website and content to rank higher in search engine results, driving organic traffic and increasing visibility.

## SEO Fundamentals
### On-Page SEO
1. **Keyword Research**: Find terms your audience searches for
2. **Title Tags**: Optimize page titles with target keywords
3. **Meta Descriptions**: Write compelling descriptions for search results
4. **Header Tags**: Structure content with H1, H2, H3 tags
5. **Internal Linking**: Connect related pages on your site

### Technical SEO
1. **Site Speed**: Optimize loading times
2. **Mobile Optimization**: Ensure mobile-friendly design
3. **SSL Certificate**: Secure your website
4. **XML Sitemap**: Help search engines crawl your site
5. **Schema Markup**: Add structured data

### Content SEO
1. **Quality Content**: Create valuable, comprehensive content
2. **Keyword Optimization**: Use keywords naturally
3. **Content Freshness**: Update content regularly
4. **Topic Clusters**: Build authority around topics
5. **User Intent**: Match content to search intent

## Implementation Timeline
### Month 1: Foundation
- Conduct comprehensive keyword research
- Optimize existing pages for target keywords
- Fix technical SEO issues
- Set up Google Analytics and Search Console

### Month 2-3: Content Creation
- Create pillar pages for main topics
- Write supporting blog posts
- Optimize all content for SEO
- Build internal linking structure

### Month 4-6: Authority Building
- Create comprehensive guides
- Build quality backlinks
- Optimize for featured snippets
- Monitor and improve rankings`,
    keyTactics: [
      'Conduct thorough keyword research',
      'Optimize on-page SEO elements',
      'Create high-quality, comprehensive content',
      'Build authoritative backlinks',
      'Monitor and improve technical SEO'
    ],
    successMetrics: [
      'Organic traffic growth',
      'Keyword ranking improvements',
      'Click-through rate from search',
      'Domain authority increase',
      'Featured snippet captures'
    ],
    commonMistakes: [
      'Keyword stuffing',
      'Ignoring technical SEO',
      'Not optimizing for user intent',
      'Buying low-quality backlinks',
      'Expecting immediate results'
    ],
    toolsNeeded: [
      'SEO tools (Ahrefs, SEMrush, Moz)',
      'Google Analytics & Search Console',
      'Keyword research tools',
      'Technical SEO audit tools',
      'Backlink analysis tools'
    ]
  },
  {
    id: 'ppc-advertising',
    name: 'PPC Advertising',
    description: 'Drive immediate, targeted traffic through paid search and display ads with measurable ROI',
    category: 'Paid',
    difficulty: 'advanced',
    timeCommitment: '8-15 hours/week',
    expectedResults: 'Immediate traffic, measurable ROI, and precise targeting capabilities',
    icon: 'Zap',
    fullGuide: `# PPC Advertising Strategy Guide

## Overview
Pay-Per-Click (PPC) advertising allows you to place ads in search results and other platforms, paying only when someone clicks your ad. It provides immediate visibility and measurable results.

## Platform Selection
### Google Ads
- **Search Ads**: Text ads in search results
- **Display Ads**: Visual ads across websites
- **Shopping Ads**: Product listings with images
- **YouTube Ads**: Video advertising

### Microsoft Ads (Bing)
- Lower competition, often cheaper clicks
- Older, higher-income demographic
- Good for B2B campaigns

### Social Media Ads
- **Facebook/Instagram**: Detailed targeting options
- **LinkedIn**: B2B professional targeting
- **Twitter**: Real-time engagement

## Campaign Structure
### Account Organization
1. **Campaigns**: Organize by product/service
2. **Ad Groups**: Group similar keywords
3. **Keywords**: Target specific search terms
4. **Ads**: Multiple variations per ad group

### Keyword Strategy
1. **Broad Match**: Widest reach, less control
2. **Phrase Match**: More control, moderate reach
3. **Exact Match**: Highest control, lowest reach
4. **Negative Keywords**: Exclude irrelevant traffic

## Implementation Steps
### Week 1: Setup & Research
- Set up tracking and conversion goals
- Conduct keyword research
- Analyze competitor ads
- Create account structure

### Week 2-4: Campaign Launch
- Create ad groups and keywords
- Write compelling ad copy
- Set up landing pages
- Launch with conservative budgets

### Week 5-8: Optimization
- Monitor performance daily
- Adjust bids and budgets
- Test new ad variations
- Refine keyword lists`,
    keyTactics: [
      'Structure campaigns logically',
      'Write compelling ad copy',
      'Use negative keywords effectively',
      'Optimize landing pages for conversions',
      'Monitor and adjust bids regularly'
    ],
    successMetrics: [
      'Click-through rate (CTR)',
      'Cost per click (CPC)',
      'Conversion rate',
      'Return on ad spend (ROAS)',
      'Quality Score'
    ],
    commonMistakes: [
      'Not using negative keywords',
      'Poor landing page experience',
      'Setting and forgetting campaigns',
      'Not tracking conversions properly',
      'Bidding on too broad keywords'
    ],
    toolsNeeded: [
      'Google Ads platform',
      'Keyword research tools',
      'Landing page builder',
      'Analytics and tracking',
      'Bid management tools'
    ]
  }
];

// Icon mapping
export const getIcon = (iconName: string) => {
  const icons: { [key: string]: any } = {
    BookOpen,
    MessageSquare,
    Mail,
    Search,
    Zap,
    Target
  };
  return icons[iconName] || BookOpen;
};

export default function EnhancedStrategyLibrary({ 
  onStrategySelect, 
  onStrategyLock, 
  selectedStrategy, 
  lockedStrategy 
}: EnhancedStrategyLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  // Filter strategies based on search and category
  const filteredStrategies = MARKETING_STRATEGIES.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || strategy.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(MARKETING_STRATEGIES.map(s => s.category.toLowerCase())))];

  const handleStrategyLock = (strategy: Strategy) => {
    onStrategyLock(strategy.id);
    toast({
      title: "Strategy Locked!",
      description: `${strategy.name} is now your focused strategy. All generated tasks will be based on this approach.`,
    });
  };

  const handleStrategyUnlock = () => {
    onStrategyLock('');
    toast({
      title: "Strategy Unlocked",
      description: "You can now select different strategies or get varied task suggestions.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with locked strategy indicator */}
      {lockedStrategy && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Focused Strategy: {lockedStrategy.name}</h3>
                  <p className="text-sm text-blue-700">All tasks will be generated based on this strategy</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleStrategyUnlock}>
                <Unlock className="h-4 w-4 mr-2" />
                Unlock
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search strategies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Strategy grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStrategies.map((strategy) => {
          const IconComponent = getIcon(strategy.icon);
          const isLocked = lockedStrategy?.id === strategy.id;
          const isSelected = selectedStrategy?.id === strategy.id;
          
          return (
            <Card 
              key={strategy.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isLocked ? 'ring-2 ring-blue-500 bg-blue-50' : 
                isSelected ? 'ring-2 ring-green-500 bg-green-50' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {React.createElement(IconComponent, { className: "h-6 w-6 text-primary" })}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{strategy.name}</CardTitle>
                      <Badge className={getDifficultyColor(strategy.difficulty)}>
                        {strategy.difficulty}
                      </Badge>
                    </div>
                  </div>
                  {isLocked && <Lock className="h-5 w-5 text-blue-600" />}
                </div>
                <CardDescription className="text-sm">
                  {strategy.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {strategy.timeCommitment}
                  </div>
                  
                  <p className="text-sm">
                    <strong>Expected Results:</strong> {strategy.expectedResults}
                  </p>
                  
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Guide
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {React.createElement(IconComponent, { className: "h-6 w-6" })}
                            {strategy.name} - Complete Guide
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {strategy.fullGuide}
                            </div>
                          </div>
                          
                          <Tabs defaultValue="tactics" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="tactics">Key Tactics</TabsTrigger>
                              <TabsTrigger value="metrics">Success Metrics</TabsTrigger>
                              <TabsTrigger value="mistakes">Common Mistakes</TabsTrigger>
                              <TabsTrigger value="tools">Tools Needed</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="tactics" className="space-y-2">
                              {strategy.keyTactics.map((tactic, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{tactic}</span>
                                </div>
                              ))}
                            </TabsContent>
                            
                            <TabsContent value="metrics" className="space-y-2">
                              {strategy.successMetrics.map((metric, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{metric}</span>
                                </div>
                              ))}
                            </TabsContent>
                            
                            <TabsContent value="mistakes" className="space-y-2">
                              {strategy.commonMistakes.map((mistake, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0">⚠️</span>
                                  <span className="text-sm">{mistake}</span>
                                </div>
                              ))}
                            </TabsContent>
                            
                            <TabsContent value="tools" className="space-y-2">
                              {strategy.toolsNeeded.map((tool, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <Zap className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{tool}</span>
                                </div>
                              ))}
                            </TabsContent>
                          </Tabs>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {!isLocked ? (
                      <Button 
                        size="sm" 
                        onClick={() => handleStrategyLock(strategy)}
                        className="flex-1"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Focus
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => onStrategySelect(strategy)}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Generate Tasks
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredStrategies.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No strategies found</h3>
          <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  );
}
