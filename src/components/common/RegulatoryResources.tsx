import { FileText, ExternalLink } from 'lucide-react';

export function RegulatoryResources() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-600" />
        Regulatory Reference Documents
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FSSAI Document - External Link */}
        <a
          href="https://fssai.gov.in/upload/uploadfiles/files/Compendium_Contaminants_Regulations_28_01_2022.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                FSSAI Compendium of Contaminants
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Official FSSAI regulations for Maximum Residue Limits (MRL) in food products (External Link).
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Version 6 • Updated: January 28, 2022
              </p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <ExternalLink className="w-4 h-4 mr-1" />
                View Official Document
              </div>
            </div>
          </div>
        </a>

        {/* EU Regulation */}
        <a
          href="https://eur-lex.europa.eu/eli/reg/2009/470/oj"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-green-200 rounded-lg p-4 hover:bg-green-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                EU Regulation (EC) No 470/2009
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                European Union standards for maximum residue limits of pharmacologically active substances in foodstuffs of animal origin.
              </p>
              <p className="text-xs text-gray-500 mb-3">
                EU Legislation • Current
              </p>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <ExternalLink className="w-4 h-4 mr-1" />
                View Regulation
              </div>
            </div>
          </div>
        </a>

        {/* FDA Standards */}
        <a
          href="https://www.fda.gov/animal-veterinary/cvm-updates/cvm-guidance-animal-cvm-guidance-documents"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-purple-200 rounded-lg p-4 hover:bg-purple-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                FDA Veterinary Drug Standards
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Food and Drug Administration (USA) guidelines and standards for veterinary drugs and their residue limits.
              </p>
              <p className="text-xs text-gray-500 mb-3">
                FDA • Center for Veterinary Medicine (CVM)
              </p>
              <div className="flex items-center text-purple-600 text-sm font-medium">
                <ExternalLink className="w-4 h-4 mr-1" />
                View Standards
              </div>
            </div>
          </div>
        </a>

        {/* Quick Reference */}
        <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Quick Reference Guide
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              MRL Status Indicators:
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span><strong>Safe:</strong> 0-50% of MRL limit</span>
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                <span><strong>Warning:</strong> &gt;50–100% of MRL limit</span>
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                <span><strong>Exceeded:</strong> &gt;100% of MRL limit</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
        <p className="font-semibold text-gray-800 mb-1">Note on Standards:</p>
        <p>
          This portal uses <strong>FSSAI standards</strong> by default for MRL calculations, which are tailored for Indian food regulations.
          EU/FDA standards are available for reference and comparison purposes. Always consult the official regulatory documents for the most current information.
        </p>
      </div>
    </div>
  );
}
