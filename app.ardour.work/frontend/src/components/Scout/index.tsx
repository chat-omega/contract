import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Search, Globe, MapPin, Users, Euro, ArrowLeft, ExternalLink, Bookmark, TrendingUp, Award, Cpu, Truck, Zap, Settings, GraduationCap, Shield } from 'lucide-react';
import { GrowthLever, Target } from '@/types';
import { synergyCategories } from '@/data/mockData';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, SearchBar, FilterButton, Badge, Modal } from '@/components/ui';
import { formatEmployeeCount, parseRevenue } from '@/utils/formatters';
import 'leaflet/dist/leaflet.css';

interface ScoutProps {
  selectedLever: GrowthLever;
  onTargetSelect: (target: Target) => void;
  selectedTarget: Target | null;
}


// Get strategic fit color based on score
function getStrategicFitColor(score?: number): string {
  if (!score) return 'text-slate-500';
  if (score >= 90) return 'text-success-600';
  if (score >= 80) return 'text-yellow-600';
  return 'text-orange-600';
}

// Get strategic fit badge variant
function getStrategicFitBadge(score?: number): 'success' | 'warning' | 'default' {
  if (!score) return 'default';
  if (score >= 90) return 'success';
  if (score >= 80) return 'warning';
  return 'default';
}

// Icon mapping for synergy categories
function getIconComponent(iconName: string) {
  const icons = {
    Globe,
    Cpu,
    Truck,
    Users,
    Zap,
    Settings,
    GraduationCap,
    Shield
  };
  return icons[iconName as keyof typeof icons] || Globe;
}

export function Scout({ selectedLever, onTargetSelect, selectedTarget }: ScoutProps) {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId || null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSelectedCategory(categoryId || null);
  }, [categoryId]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('revenue');
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [modalTarget, setModalTarget] = useState<Target | null>(null);

  const currentCategory = synergyCategories.find(c => c.id === selectedCategory);
  
  // Filter and sort targets
  const filteredTargets = currentCategory?.targets.filter(target => {
    const matchesSearch = target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSectors.length === 0 || selectedSectors.includes(target.sector);
    return matchesSearch && matchesSector;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return parseRevenue(b.revenue || '0') - parseRevenue(a.revenue || '0');
      case 'employees':
        return (b.employees || 0) - (a.employees || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  }) || [];

  // Get available sectors for filtering
  const availableSectors = [...new Set(synergyCategories.flatMap(c => c.targets.map(t => t.sector)))];
  const sectorOptions = availableSectors.map(sector => ({
    value: sector,
    label: sector,
    count: synergyCategories.flatMap(c => c.targets).filter(t => t.sector === sector).length
  }));

  const sortOptions = [
    { value: 'revenue', label: 'Revenue' },
    { value: 'employees', label: 'Team Size' },
    { value: 'name', label: 'Name' }
  ];

  const handleTargetDetails = (target: Target) => {
    setModalTarget(target);
    setShowTargetModal(true);
    onTargetSelect(target);
  };

  return (
    <>
      <div className="flex-1 bg-slate-50 flex flex-col">
        {/* Header with breadcrumb navigation */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold gradient-text">SCOUT</h1>
                  <Badge variant="accent" size="sm">Discovery</Badge>
                </div>
                <p className="text-sm text-slate-600">AI-powered target identification & market intelligence</p>
              </div>
            </div>
            
            {selectedCategory && (
              <button
                onClick={() => navigate('/scout')}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back to Synergy Categories</span>
              </button>
            )}
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-600">Bolt-on Acquisition Synergies</span>
            {selectedCategory && (
              <>
                <span className="text-slate-400">›</span>
                <span className="font-medium text-slate-900">{currentCategory?.name}</span>
                <span className="text-slate-400">›</span>
                <span className="text-accent-600">{filteredTargets.length} targets</span>
              </>
            )}
          </div>
        </div>

        {/* Synergy Categories View */}
        {!selectedCategory ? (
          <div className="flex-1 p-6 transition-all duration-500 ease-in-out">
            <div className="mb-8 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-4">
                <Search className="w-6 h-6 text-accent-600" />
                <h2 className="text-xl font-semibold text-slate-900">Bolt-on Acquisition Synergies</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Discover strategic <span className="font-medium text-accent-600">{selectedLever}</span> opportunities organized by synergy potential. 
                Our AI-powered intelligence identifies companies that create maximum value through operational and strategic synergies.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {synergyCategories.map((category, index) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <Card
                    key={category.id}
                    onClick={() => navigate(`/scout/${category.id}`)}
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl min-h-[280px] flex flex-col animate-scaleIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0 max-w-[calc(100%-70px)]">
                          <div className={`w-12 h-12 bg-gradient-to-br from-${category.color}-100 to-${category.color}-200 rounded-xl flex items-center justify-center group-hover:from-${category.color}-200 group-hover:to-${category.color}-300 transition-all duration-300 flex-shrink-0`}>
                            <IconComponent className={`w-6 h-6 text-${category.color}-600 group-hover:text-${category.color}-700`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="group-hover:text-accent-700 transition-colors text-base leading-tight mb-1 truncate">
                              {category.name}
                            </CardTitle>
                            <p className="text-sm text-slate-500 truncate">Synergy opportunity</p>
                          </div>
                        </div>
                        <div className="text-center flex-shrink-0 min-w-[60px] max-w-[60px]">
                          <div className="text-2xl font-bold text-accent-600 leading-none">{category.count}</div>
                          <div className="text-xs uppercase tracking-wide text-slate-500 font-medium mt-1">Targets</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">{category.description}</p>
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="text-sm flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              <span className="text-slate-600 font-medium truncate">{category.valuePotential}</span>
                            </div>
                          </div>
                          <div className="text-accent-600 font-medium text-sm group-hover:text-accent-700 flex-shrink-0 ml-3">
                            Explore →
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

          </div>
        ) : (
          /* Category Detail View - Three Panel Layout or List View */
          <div className="flex-1 flex flex-col transition-all duration-500 ease-in-out animate-slideInUp">
            {/* Search and Filter Bar */}
            <div className="bg-white border-b border-slate-200 p-4">
              <div className="flex items-center space-x-4">
                <SearchBar
                  placeholder="Search targets..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="flex-1"
                />
                <FilterButton
                  label="Sector"
                  options={sectorOptions}
                  selectedValues={selectedSectors}
                  onChange={setSelectedSectors}
                  multiSelect
                />
                <FilterButton
                  label="Sort by"
                  options={sortOptions}
                  selectedValues={[sortBy]}
                  onChange={(values) => setSortBy(values[0] || 'revenue')}
                />
              </div>
            </div>

            {/* Three Panel Layout - Show map only for Geographic Expansion */}
            <div className="flex-1 flex">
              {/* Left Panel - Interactive Map (only for Geographic Expansion) */}
              {selectedCategory === 'geographic-expansion' && (
                <div className="w-1/3 bg-white border-r border-slate-200 p-4">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">Regional Map</h3>
                      <Badge variant="default" size="sm">{filteredTargets.length} shown</Badge>
                    </div>
                    
                    <div className="flex-1 rounded-lg overflow-hidden border border-slate-200">
                      <MapContainer
                        center={[52.5, 10.0]}
                        zoom={4}
                        style={{ height: '100%', width: '100%' }}
                        key={selectedCategory}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        
                        {filteredTargets.map((target) => (
                          <Marker 
                            key={target.id} 
                            position={target.coordinates}
                            eventHandlers={{
                              click: () => {
                                onTargetSelect(target);
                              }
                            }}
                          >
                            <Popup>
                              <div className="p-3 min-w-64">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-slate-900">{target.name}</h4>
                                  {target.strategicFit && (
                                    <Badge variant={getStrategicFitBadge(target.strategicFit)} size="sm">
                                      {target.strategicFit}% fit
                                    </Badge>
                                  )}
                                </div>
                                <Badge variant="default" size="sm" className="mb-2">{target.sector}</Badge>
                                <p className="text-sm text-slate-600 mb-3">{target.description}</p>
                                
                                <div className="space-y-1 mb-3 text-xs">
                                  {target.revenue && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Revenue:</span>
                                      <span className="font-medium text-success-600">{target.revenue}</span>
                                    </div>
                                  )}
                                  {target.fundingStage && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Stage:</span>
                                      <span className="font-medium">{target.fundingStage}</span>
                                    </div>
                                  )}
                                  {target.lastFunding && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Last Funding:</span>
                                      <span className="font-medium">{target.lastFunding}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <button
                                  onClick={() => handleTargetDetails(target)}
                                  className="btn-primary text-xs py-1 px-3 w-full"
                                >
                                  View Full Analysis
                                </button>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Center Panel - Target List */}
              <div className={`${selectedCategory === 'geographic-expansion' ? 'w-1/3' : 'w-1/2'} bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto`}>
                <div className="space-y-3 animate-fadeIn">
                  {filteredTargets.map((target) => (
                    <Card
                      key={target.id}
                      onClick={() => handleTargetDetails(target)}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                        selectedTarget?.id === target.id ? 'ring-2 ring-accent-500 border-accent-300 shadow-lg' : ''
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <CardTitle className="text-base">{target.name}</CardTitle>
                              {target.strategicFit && (
                                <Badge variant={getStrategicFitBadge(target.strategicFit)} size="sm">
                                  {target.strategicFit}%
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="default" size="sm">{target.sector}</Badge>
                              {target.fundingStage && (
                                <Badge variant="default" size="sm">{target.fundingStage}</Badge>
                              )}
                            </div>
                          </div>
                          <button className="p-1 hover:bg-slate-100 rounded-md transition-colors">
                            <Bookmark className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{target.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Location</span>
                            <span className="font-medium">{target.location}</span>
                          </div>
                          
                          {target.revenue && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Revenue</span>
                              <span className="font-medium text-success-600">{target.revenue}</span>
                            </div>
                          )}
                          
                          {target.employees && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Team Size</span>
                              <span className="font-medium">{formatEmployeeCount(target.employees)}</span>
                            </div>
                          )}
                          
                          {target.lastFunding && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Last Funding</span>
                              <span className="font-medium text-accent-600">{target.lastFunding}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-3">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            {target.strategicFit && (
                              <>
                                <div className={`w-2 h-2 rounded-full ${
                                  target.strategicFit >= 90 ? 'bg-success-500' : 
                                  target.strategicFit >= 80 ? 'bg-yellow-500' : 'bg-orange-500'
                                }`}></div>
                                <span className={`text-xs font-medium ${getStrategicFitColor(target.strategicFit)}`}>
                                  {target.strategicFit >= 90 ? 'Excellent fit' : 
                                   target.strategicFit >= 80 ? 'Good fit' : 'Moderate fit'}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center text-accent-600 hover:text-accent-700 transition-colors">
                            <span className="text-sm font-medium">View Analysis</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                  
                  {filteredTargets.length === 0 && (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No targets match your search criteria</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Target Details */}
              <div className={`${selectedCategory === 'geographic-expansion' ? 'w-1/3' : 'w-1/2'} bg-white p-6 overflow-y-auto`}>
                {selectedTarget ? (
                  <div className="space-y-6 animate-slideInRight">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedTarget.name}</h3>
                      <div className="flex items-center space-x-2 mb-4">
                        <Badge variant="primary">{selectedTarget.sector}</Badge>
                        {selectedTarget.fundingStage && (
                          <Badge variant="default">{selectedTarget.fundingStage}</Badge>
                        )}
                        {selectedTarget.strategicFit && (
                          <Badge variant={getStrategicFitBadge(selectedTarget.strategicFit)}>
                            {selectedTarget.strategicFit}% Strategic Fit
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed">{selectedTarget.description}</p>
                    </div>

                    {(selectedTarget.revenue || selectedTarget.employees || selectedTarget.lastFunding) && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Key Metrics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedTarget.revenue && (
                            <div className="bg-slate-50 rounded-lg p-3">
                              <div className="flex items-center space-x-1 mb-1">
                                <TrendingUp className="w-3 h-3 text-slate-400" />
                                <div className="text-xs text-slate-500 uppercase tracking-wide">Annual Revenue</div>
                              </div>
                              <div className="text-lg font-bold text-success-600">{selectedTarget.revenue}</div>
                            </div>
                          )}
                          {selectedTarget.employees && (
                            <div className="bg-slate-50 rounded-lg p-3">
                              <div className="flex items-center space-x-1 mb-1">
                                <Users className="w-3 h-3 text-slate-400" />
                                <div className="text-xs text-slate-500 uppercase tracking-wide">Team Size</div>
                              </div>
                              <div className="text-lg font-bold text-slate-900">{selectedTarget.employees}</div>
                            </div>
                          )}
                          {selectedTarget.lastFunding && (
                            <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                              <div className="flex items-center space-x-1 mb-1">
                                <Euro className="w-3 h-3 text-slate-400" />
                                <div className="text-xs text-slate-500 uppercase tracking-wide">Last Funding Round</div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-lg font-bold text-accent-600">{selectedTarget.lastFunding}</div>
                                {selectedTarget.fundingStage && (
                                  <Badge variant="default" size="sm">{selectedTarget.fundingStage}</Badge>
                                )}
                              </div>
                            </div>
                          )}
                          {selectedTarget.strategicFit && (
                            <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                              <div className="flex items-center space-x-1 mb-1">
                                <Award className="w-3 h-3 text-slate-400" />
                                <div className="text-xs text-slate-500 uppercase tracking-wide">Strategic Alignment</div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className={`text-lg font-bold ${getStrategicFitColor(selectedTarget.strategicFit)}`}>
                                  {selectedTarget.strategicFit}% Match
                                </div>
                                <div className={`text-sm font-medium ${getStrategicFitColor(selectedTarget.strategicFit)}`}>
                                  {selectedTarget.strategicFit >= 90 ? 'Excellent Fit' : 
                                   selectedTarget.strategicFit >= 80 ? 'Good Fit' : 'Moderate Fit'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedTarget.techStack && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Technology Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTarget.techStack.map((tech) => (
                            <Badge key={tech} variant="default" size="sm">{tech}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <button className="btn-primary w-full">
                        Request Introduction
                      </button>
                      <button className="btn-secondary w-full">
                        Add to Pipeline
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-2">Select a Target</h3>
                    <p className="text-slate-500 text-sm">Choose a company from the list to view detailed information and analysis</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Details Modal */}
      <Modal
        isOpen={showTargetModal}
        onClose={() => setShowTargetModal(false)}
        title="Target Analysis"
        size="xl"
      >
        {modalTarget && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{modalTarget.name}</h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="primary">{modalTarget.sector}</Badge>
                  {modalTarget.fundingStage && (
                    <Badge variant="default">{modalTarget.fundingStage}</Badge>
                  )}
                  {modalTarget.strategicFit && (
                    <Badge variant={getStrategicFitBadge(modalTarget.strategicFit)}>
                      Strategic Fit: {modalTarget.strategicFit}%
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="btn-secondary">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save
                </button>
                <button className="btn-primary">
                  Request Intro
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Company Overview</h3>
                  <p className="text-slate-600 leading-relaxed">{modalTarget.description}</p>
                </div>
                
                {modalTarget.techStack && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Technology Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {modalTarget.techStack.map((tech) => (
                        <Badge key={tech} variant="default">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-3">Key Metrics</h4>
                  <div className="space-y-3">
                    {modalTarget.revenue && (
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-slate-400" />
                          <div className="text-xs text-slate-500 uppercase tracking-wide">Revenue</div>
                        </div>
                        <div className="font-bold text-success-600">{modalTarget.revenue}</div>
                      </div>
                    )}
                    {modalTarget.employees && (
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <div className="text-xs text-slate-500 uppercase tracking-wide">Employees</div>
                        </div>
                        <div className="font-bold text-slate-900">{modalTarget.employees}</div>
                      </div>
                    )}
                    {modalTarget.lastFunding && (
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <Euro className="w-3 h-3 text-slate-400" />
                          <div className="text-xs text-slate-500 uppercase tracking-wide">Last Funding</div>
                        </div>
                        <div className="font-bold text-accent-600">{modalTarget.lastFunding}</div>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-1 mb-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Location</div>
                      </div>
                      <div className="font-bold text-slate-900">{modalTarget.location}</div>
                    </div>
                    {modalTarget.strategicFit && (
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <Award className="w-3 h-3 text-slate-400" />
                          <div className="text-xs text-slate-500 uppercase tracking-wide">Strategic Fit</div>
                        </div>
                        <div className={`font-bold ${getStrategicFitColor(modalTarget.strategicFit)}`}>
                          {modalTarget.strategicFit}% Match
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}